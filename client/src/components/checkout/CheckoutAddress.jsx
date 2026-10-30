import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Briefcase, Home, MapPin, Plus, Star } from 'lucide-react';

import AuthField from '../auth/AuthField';
import Button from '../common/Button';
import { addAddress } from '../../slices/addressSlice';
import { useToast } from '../notifications';

// Delivery address step of checkout: pick a saved address or add one without
// leaving the page, so the cart is never lost.
//
// The form sends POST /addresses and the parent is told about the new address so
// it can be selected straight away. Validation mirrors address.validator.js.
const EMPTY_FORM = {
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  type: 'home',
};

const TYPE_OPTIONS = [
  { value: 'home', label: 'Home', Icon: Home },
  { value: 'work', label: 'Work', Icon: Briefcase },
];

const validate = (values) => {
  const errors = {};

  if (values.fullName.trim().length < 2) errors.fullName = 'Enter the full name.';
  if (!/^[6-9][0-9]{9}$/.test(values.phone.trim())) {
    errors.phone = 'Enter a 10-digit mobile number.';
  }
  if (values.addressLine1.trim().length < 3) {
    errors.addressLine1 = 'Enter the house or flat number and street.';
  }
  if (!values.city.trim()) errors.city = 'City is required.';
  if (!values.state.trim()) errors.state = 'State is required.';
  if (!/^[1-9][0-9]{5}$/.test(values.postalCode.trim())) {
    errors.postalCode = 'Enter a 6-digit PIN code.';
  }
  if (values.country.trim().length < 2) errors.country = 'Country is required.';

  return errors;
};

export default function CheckoutAddress({
  addresses = [],
  selectedId,
  onSelect,
  onAdded,
  disabled = false,
}) {
  const dispatch = useDispatch();
  const toast = useToast();

  const [formOpen, setFormOpen] = useState(addresses.length === 0);
  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleChange = (field) => (event) => {
    const { value } = event.target;
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = {
      fullName: values.fullName.trim(),
      phone: values.phone.trim(),
      addressLine1: values.addressLine1.trim(),
      city: values.city.trim(),
      state: values.state.trim(),
      postalCode: values.postalCode.trim(),
      country: values.country.trim(),
      type: values.type,
    };
    if (values.addressLine2.trim()) payload.addressLine2 = values.addressLine2.trim();

    setSaving(true);
    try {
      const response = await dispatch(addAddress(payload)).unwrap();
      toast.success('Address saved.');
      onAdded?.(response.data);
      setValues(EMPTY_FORM);
      setErrors({});
      setFormOpen(false);
    } catch (message) {
      toast.error(String(message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-3xl border border-border bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl font-medium tracking-tight text-primary">
            Delivery address
          </h2>
          <p className="mt-1 text-xs text-muted">
            Choose where the order should go, or save a new address.
          </p>
        </div>

        {!formOpen && (
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            disabled={disabled}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-white px-4 text-xs font-semibold text-primary transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
          >
            <Plus size={14} strokeWidth={2} aria-hidden="true" />
            Add new address
          </button>
        )}
      </div>

      {addresses.length > 0 && (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {addresses.map((address) => {
            const checked = String(selectedId) === String(address._id);
            const Icon = address.type === 'work' ? Briefcase : Home;

            return (
              <li key={address._id}>
                <label
                  className={[
                    'flex h-full cursor-pointer gap-3 rounded-2xl border p-4 transition-colors',
                    checked
                      ? 'border-accent bg-peach/20'
                      : 'border-border bg-background/40 hover:border-accent/50',
                  ].join(' ')}
                >
                  <input
                    type="radio"
                    name="shipping-address"
                    value={address._id}
                    checked={checked}
                    onChange={() => onSelect(address._id)}
                    disabled={disabled}
                    className="mt-1 size-4 shrink-0 accent-[var(--accent)]"
                  />

                  <span
                    aria-hidden="true"
                    className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-white text-primary"
                  >
                    <Icon size={16} strokeWidth={1.8} />
                  </span>

                  <span className="min-w-0 text-xs leading-5 text-muted">
                    <span className="flex flex-wrap items-center gap-2 text-sm font-medium text-primary">
                      {address.fullName || 'Saved address'}
                      {address.default && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                          <Star size={9} strokeWidth={2} aria-hidden="true" />
                          Default
                        </span>
                      )}
                    </span>

                    <span className="mt-1 block">
                      {address.addressLine1}
                      {address.addressLine2 ? `, ${address.addressLine2}` : ''}
                      <br />
                      {address.city}, {address.state} {address.postalCode}
                      <br />
                      {address.country}
                      {address.phone ? ` · ${address.phone}` : ''}
                    </span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      )}

      {formOpen && (
        <form onSubmit={handleSubmit} noValidate className="mt-5 rounded-2xl border border-border bg-background/40 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-medium text-primary">New address</h3>

            {addresses.length > 0 && (
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                disabled={saving}
                className="text-xs font-medium text-muted underline decoration-border underline-offset-4 hover:text-primary"
              >
                Use a saved address
              </button>
            )}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <AuthField
              label="Full name"
              name="checkout-full-name"
              value={values.fullName}
              onChange={handleChange('fullName')}
              error={errors.fullName}
              required
            />

            <AuthField
              label="Mobile number"
              name="checkout-phone"
              value={values.phone}
              onChange={handleChange('phone')}
              error={errors.phone}
              hint="10 digits, used by the courier."
              required
            />

            <div className="sm:col-span-2">
              <AuthField
                label="House or flat number, street"
                name="checkout-line-1"
                icon={MapPin}
                value={values.addressLine1}
                onChange={handleChange('addressLine1')}
                error={errors.addressLine1}
                required
              />
            </div>

            <div className="sm:col-span-2">
              <AuthField
                label="Area or landmark"
                name="checkout-line-2"
                value={values.addressLine2}
                onChange={handleChange('addressLine2')}
                error={errors.addressLine2}
                hint="Optional, helps the courier find you."
              />
            </div>

            <AuthField
              label="City"
              name="checkout-city"
              value={values.city}
              onChange={handleChange('city')}
              error={errors.city}
              required
            />

            <AuthField
              label="State"
              name="checkout-state"
              value={values.state}
              onChange={handleChange('state')}
              error={errors.state}
              required
            />

            <AuthField
              label="PIN code"
              name="checkout-pin"
              value={values.postalCode}
              onChange={handleChange('postalCode')}
              error={errors.postalCode}
              required
            />

            <AuthField
              label="Country"
              name="checkout-country"
              value={values.country}
              onChange={handleChange('country')}
              error={errors.country}
              required
            />
          </div>

          <fieldset className="mt-4">
            <legend className="text-sm font-medium text-primary">Address type</legend>

            <div className="mt-2 flex gap-2">
              {TYPE_OPTIONS.map(({ value, label, Icon }) => (
                <label
                  key={value}
                  className={[
                    'flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-colors',
                    values.type === value
                      ? 'border-accent bg-white text-accent'
                      : 'border-border bg-white text-primary hover:border-accent/50',
                  ].join(' ')}
                >
                  <input
                    type="radio"
                    name="checkout-address-type"
                    value={value}
                    checked={values.type === value}
                    onChange={handleChange('type')}
                    className="size-3.5 accent-[var(--accent)]"
                  />
                  <Icon size={14} strokeWidth={1.8} aria-hidden="true" />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-5">
            <Button type="submit" variant="secondary" loading={saving} disabled={saving || disabled}>
              Save and deliver here
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
