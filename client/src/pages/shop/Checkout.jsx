import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { LockKeyhole, ShieldCheck, Truck, Wallet } from 'lucide-react';

import CheckoutAddress from '../../components/checkout/CheckoutAddress';
import Button from '../../components/common/Button';
import PageState from '../../components/common/PageState';
import Spinner from '../../components/common/Spinner';
import StorefrontLayout from '../../components/layout/StorefrontLayout';
import { useToast } from '../../components/notifications';
import { getContent } from '../../data/content';
import { fetchAddresses } from '../../slices/addressSlice';
import { fetchCart } from '../../slices/cartSlice';
import { addOrder } from '../../slices/orderSlice';
import { confirmPayment, startPayment } from '../../slices/paymentSlice';
import { validateCoupon as validateCouponCode } from '../../services/couponService';
import { formatPrice } from '../../utils/format';
import { openRazorpayCheckout } from '../../utils/razorpay';

// Checkout: the cart on the left, delivery + payment + totals on the right.
//
// The server is the source of truth. The page never sends prices: it sends the
// chosen address, an optional coupon code, the payment method and one
// idempotency key, and the backend re-reads the cart, checks stock and builds the
// order. Razorpay is opened from the order the backend created, and the payment
// only counts once /payments/verify has checked the signature.
const copy = getContent('checkout', {});
const COD_ENABLED = getContent('checkout.codEnabled', true);

const newKey = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `key-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const { cart, loading: cartLoading } = useSelector((state) => state.cart);
  const addresses = useSelector((state) => state.addresses.items);
  const user = useSelector((state) => state.auth.user);

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [couponBusy, setCouponBusy] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState(null);
  const [pendingOrder, setPendingOrder] = useState(null);

  // One key per checkout attempt: a double click sends the same key twice, and
  // the backend returns the order it already created instead of a second one.
  const orderKey = useRef(null);

  useEffect(() => {
    dispatch(fetchCart());
    dispatch(fetchAddresses());
  }, [dispatch]);

  // The saved default address is used until the customer picks another one, so
  // no state has to be copied from the address list into an effect.
  const selectedAddress =
    addresses.find((address) => address._id === selectedAddressId) ??
    addresses.find((address) => address.default) ??
    addresses[0] ??
    null;

  const priced = useMemo(
    () =>
      (cart?.products ?? []).map((item) => {
        const product = item.productId ?? {};
        const variant = product.variantCombinations?.find(
          (option) => option._id === item.variantId,
        );
        const price = variant?.price ?? product.price ?? 0;

        return {
          id: item._id,
          name: product.name ?? 'Product',
          image: variant?.mainImage || product.mainImage,
          variantName: variant?.variantName,
          quantity: item.quantity,
          price,
          lineTotal: price * item.quantity,
        };
      }),
    [cart?.products],
  );

  const subtotal = priced.reduce((total, item) => total + item.lineTotal, 0);
  const discount = coupon?.discountAmount ?? 0;
  const total = Math.max(0, subtotal - discount);
  const itemCount = priced.reduce((count, item) => count + item.quantity, 0);

  const handleApplyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) return;

    setCouponBusy(true);
    setError(null);

    try {
      const response = await validateCouponCode(code);
      setCoupon(response.data);
      toast.success(`Coupon ${response.data.code} applied.`);
    } catch (requestError) {
      setCoupon(null);
      setError(requestError.response?.data?.message || requestError.message);
    } finally {
      setCouponBusy(false);
    }
  };

  // Starts (or reuses) the Razorpay payment for an order and opens the window.
  const payForOrder = async (order) => {
    // The thunks resolve to the API envelope, so the record itself is in .data.
    const payment = (
      await dispatch(startPayment({ orderId: order._id, idempotencyKey: newKey() })).unwrap()
    ).data;

    const opened = await openRazorpayCheckout({
      payment,
      order,
      prefill: {
        name: selectedAddress?.fullName ?? `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim(),
        email: user?.email,
        phone: selectedAddress?.phone ?? user?.phone,
      },
      onSuccess: async (response) => {
        try {
          await dispatch(
            confirmPayment({
              orderId: order._id,
              providerOrderId: payment.providerOrderId,
              providerPaymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            }),
          ).unwrap();

          await dispatch(fetchCart());
          navigate(`/order-success/${order._id}`, { replace: true });
        } catch (verifyError) {
          setError(
            `We could not confirm the payment: ${verifyError}. Your order is saved as unpaid — open My orders to pay again.`,
          );
          setPendingOrder(order);
        } finally {
          setPlacing(false);
        }
      },
      onDismiss: () => {
        setPlacing(false);
        setPendingOrder(order);
        setError('Payment cancelled. Your order is saved — you can pay for it from My orders.');
      },
      onFailure: (message) => {
        setPlacing(false);
        setPendingOrder(order);
        setError(`${message} Your order is saved as unpaid.`);
      },
    });

    if (!opened) setPlacing(false);
  };

  const handlePlaceOrder = async () => {
    if (placing) return;

    if (!priced.length) {
      setError('Your bag is empty.');
      return;
    }

    if (!selectedAddress) {
      setError('Choose a delivery address first.');
      return;
    }

    if (!selectedAddress.fullName || !selectedAddress.phone) {
      setError('This address is missing a name or mobile number. Add a new address to continue.');
      return;
    }

    setPlacing(true);
    setError(null);

    if (!orderKey.current) orderKey.current = newKey();

    try {
      const order = (
        await dispatch(
          addOrder({
            shippingAddressId: selectedAddress._id,
            couponCode: coupon?.code,
            paymentMethod,
            idempotencyKey: orderKey.current,
          }),
        ).unwrap()
      ).data;

      if (paymentMethod === 'cod') {
        await dispatch(fetchCart());
        toast.success('Order placed. Pay when it arrives.');
        navigate(`/order-success/${order._id}`, { replace: true });
        return;
      }

      await payForOrder(order);
    } catch (requestError) {
      setError(String(requestError));
      setPlacing(false);
    }
  };

  if (cartLoading && !cart) {
    return (
      <StorefrontLayout>
        <div className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-8">
          <Spinner block label="Loading your bag…" />
        </div>
      </StorefrontLayout>
    );
  }

  if (priced.length === 0) {
    return (
      <StorefrontLayout>
        <div className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-8">
          <PageState
            title="Your bag is empty"
            description="Add something you love before checking out."
            actionLabel="Browse the collection"
            onAction={() => navigate('/shop')}
          />
        </div>
      </StorefrontLayout>
    );
  }

  return (
    <StorefrontLayout>
      <div className="mx-auto w-full max-w-[1900px] px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
        <header>
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-accent">
            {copy.eyebrow ?? 'Secure checkout'}
          </p>
          <h1 className="mt-3 font-serif text-3xl font-medium tracking-tight text-primary sm:text-4xl">
            {copy.title ?? 'Checkout'}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
            {copy.description ??
              'Confirm your delivery details and pay. Prices and stock are checked again by the studio before the order is created.'}
          </p>
        </header>

        {error && (
          <p role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
            {error}
          </p>
        )}

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-8">
          <div className="flex flex-col gap-6">
            <CheckoutAddress
              addresses={addresses}
              selectedId={selectedAddress?._id ?? null}
              onSelect={setSelectedAddressId}
              onAdded={(address) => {
                setSelectedAddressId(address._id);
                dispatch(fetchAddresses());
              }}
              disabled={placing}
            />

            {/* Bag */}
            <section className="rounded-3xl border border-border bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-serif text-xl font-medium tracking-tight text-primary">
                  Your bag ({itemCount})
                </h2>

                <Link to="/shop" className="text-xs font-semibold text-accent hover:text-primary">
                  Add more items
                </Link>
              </div>

              <ul className="mt-4 divide-y divide-border border-t border-border">
                {priced.map((item) => (
                  <li key={item.id} className="flex items-center gap-4 py-4">
                    <span className="size-16 shrink-0 overflow-hidden rounded-xl border border-border bg-peach/30">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      ) : null}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-primary">
                        {item.name}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted">
                        {item.variantName ? `${item.variantName} · ` : ''}
                        {item.quantity} × {formatPrice(item.price)}
                      </span>
                    </span>

                    <span className="shrink-0 text-sm font-semibold text-primary">
                      {formatPrice(item.lineTotal)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Totals and payment */}
          <div className="flex flex-col gap-6 lg:sticky lg:top-28">
            <section className="rounded-3xl border border-border bg-white p-5 sm:p-6">
              <h2 className="font-serif text-xl font-medium tracking-tight text-primary">
                {copy.summaryTitle ?? 'Order summary'}
              </h2>

              <div className="mt-4 flex flex-col gap-2 text-sm">
                <div className="flex justify-between gap-4 text-muted">
                  <span>Subtotal</span>
                  <span className="text-primary">{formatPrice(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between gap-4 text-muted">
                    <span>Coupon {coupon?.code}</span>
                    <span className="text-green-700">− {formatPrice(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between gap-4 text-muted">
                  <span>Delivery</span>
                  <span className="text-primary">Free</span>
                </div>

                <div className="mt-2 flex justify-between gap-4 border-t border-border pt-3 text-base">
                  <span className="font-medium text-primary">Total payable</span>
                  <span className="font-semibold text-primary">{formatPrice(total)}</span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(event) => setCouponInput(event.target.value.toUpperCase())}
                  placeholder="Coupon code"
                  aria-label="Coupon code"
                  className="min-h-10 w-full rounded-xl border border-border bg-background px-3 text-sm uppercase text-primary outline-none focus:border-accent focus:ring-4 focus:ring-accent/15"
                />

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  loading={couponBusy}
                  disabled={couponBusy || !couponInput.trim()}
                  onClick={handleApplyCoupon}
                >
                  Apply
                </Button>
              </div>

              {coupon && (
                <button
                  type="button"
                  onClick={() => {
                    setCoupon(null);
                    setCouponInput('');
                  }}
                  className="mt-2 text-[11px] font-medium text-muted underline decoration-border underline-offset-4 hover:text-primary"
                >
                  Remove coupon {coupon.code}
                </button>
              )}
            </section>

            <section className="rounded-3xl border border-border bg-white p-5 sm:p-6">
              <h2 className="font-serif text-xl font-medium tracking-tight text-primary">
                {copy.paymentTitle ?? 'Payment'}
              </h2>

              <div className="mt-4 flex flex-col gap-3">
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-background/40 p-4 transition-colors has-[:checked]:border-accent has-[:checked]:bg-peach/20">
                  <input
                    type="radio"
                    name="payment-method"
                    value="razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => setPaymentMethod('razorpay')}
                    disabled={placing}
                    className="mt-1 size-4 accent-[var(--accent)]"
                  />

                  <span className="min-w-0">
                    <span className="flex items-center gap-2 text-sm font-medium text-primary">
                      <ShieldCheck size={16} strokeWidth={1.8} aria-hidden="true" />
                      Pay online
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-muted">
                      Card, UPI, netbanking or wallet through Razorpay. The payment is confirmed on
                      the server before the order is marked paid.
                    </span>
                  </span>
                </label>

                {COD_ENABLED && (
                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-background/40 p-4 transition-colors has-[:checked]:border-accent has-[:checked]:bg-peach/20">
                    <input
                      type="radio"
                      name="payment-method"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      disabled={placing}
                      className="mt-1 size-4 accent-[var(--accent)]"
                    />

                    <span className="min-w-0">
                      <span className="flex items-center gap-2 text-sm font-medium text-primary">
                        <Wallet size={16} strokeWidth={1.8} aria-hidden="true" />
                        Cash on delivery
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-muted">
                        Pay the courier when the parcel arrives. The order is placed right away.
                      </span>
                    </span>
                  </label>
                )}
              </div>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                className="mt-5"
                loading={placing}
                disabled={placing}
                onClick={handlePlaceOrder}
              >
                <LockKeyhole size={16} strokeWidth={1.8} aria-hidden="true" />
                {paymentMethod === 'cod'
                  ? copy.placeOrderCod ?? 'Place order'
                  : copy.placeOrder ?? 'Place order and pay'}
              </Button>

              <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted">
                <Truck size={13} strokeWidth={1.8} aria-hidden="true" />
                {formatPrice(total)} payable · free delivery
              </p>

              {pendingOrder && (
                <Link
                  to={`/orders/${pendingOrder._id}`}
                  className="mt-3 block text-xs font-semibold text-accent hover:text-primary"
                >
                  Open order {pendingOrder.orderNumber} to pay again
                </Link>
              )}
            </section>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
}
