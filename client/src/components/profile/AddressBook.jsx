import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Home,
  MapPin,
  Pencil,
  Plus,
  Briefcase,
  Star,
  Store,
  Trash2,
} from 'lucide-react';

import AuthField from '../auth/AuthField';
import Button from '../common/Button';
import {
  addAddress,
  editAddress,
  fetchAddresses,
  removeAddress,
} from '../../slices/addressSlice';
import { useToast } from '../notifications';

// Address book. Every action below maps to a real endpoint the customer owns:
// GET /addresses, POST /addresses, PATCH /addresses/:id, DELETE /addresses/:id.
//
// The server owns the "default address" rules (the first address becomes the
// default, and deleting the default promotes another one), so the list is
// re-fetched after every save instead of being patched locally.
//
// The type is one of the three values the API accepts ("home" | "work" | "other")
// and is picked with radio cards: each card is a real <input type="radio"> in the
// same group, so arrow keys move between them and a screen reader announces the
// choice, while the icon and the highlighted card carry the look.
const TYPE_OPTIONS = [
  { value: 'home', label: 'Home', hint: 'Where you live', Icon: Home },
  { value: 'work', label: 'Work', hint: 'Office or workplace', Icon: Briefcase },
  { value: 'other', label: 'Other', hint: 'Anywhere else', Icon: Store },
];

const EMPTY_FORM = {
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  type: 'home',
};

const typeLabel = (value) =>
  TYPE_OPTIONS.find((option) => option.value === value)?.label ?? 'Other';

const typeIcon = (value) =>
  TYPE_OPTIONS.find((option) => option.value === value)?.Icon ?? MapPin;

// Mirrors the server rules in address.validator.js so the API error is not the
// first the customer hears about a too-short field.
const validate = (values) => {
  const errors = {};

  if (values.addressLine1.trim().length < 3) {
    errors.addressLine1 = 'Use at least 3 characters.';
  }
  if (values.addressLine2.trim().length > 200) {
    errors.addressLine2 = 'Keep this under 200 characters.';
  }
  if (!values.city.trim()) errors.city = 'City is required.';
  if (!values.state.trim()) errors.state = 'State is required.';

  const postalCode = values.postalCode.trim();
  if (postalCode.length < 3 || postalCode.length > 20) {
    errors.postalCode = 'Use 3 to 20 characters.';
  }
  if (values.country.trim().length < 2) {
    errors.country = 'Use at least 2 characters.';
  }

  return errors;
};

const ACTION_BUTTON =
  'inline-flex min-h-9 items-center gap-2 rounded-full border px-3 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-45';

export default function AddressBook() {
  const dispatch = useDispatch();

  const { items, loading, error } = useSelector((state) => state.addresses);

  const [values, setValues] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [busyId, setBusyId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const toast = useToast();

  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  const resetForm = () => {
    setValues(EMPTY_FORM);
    setEditingId(null);
    setFieldErrors({});
  };

  const handleChange = (field) => (event) => {
    const { value } = event.target;
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validate(values);
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = {
      addressLine1: values.addressLine1.trim(),
      city: values.city.trim(),
      state: values.state.trim(),
      postalCode: values.postalCode.trim(),
      country: values.country.trim(),
      type: values.type,
    };
    // The optional line is omitted rather than sent empty, which is what the
    // API expects for an address without a second line.
    if (values.addressLine2.trim()) {
      payload.addressLine2 = values.addressLine2.trim();
    }

    try {
      if (editingId) {
        await dispatch(editAddress({ addressId: editingId, address: payload })).unwrap();
        toast.success('Address updated.');
      } else {
        await dispatch(addAddress(payload)).unwrap();
        toast.success('Address added.');
      }

      resetForm();
      dispatch(fetchAddresses());
    } catch (message) {
      toast.error(String(message));
    }
  };

  const handleEdit = (address) => {
    setEditingId(address._id);
    setFieldErrors({});
    setValues({
      addressLine1: address.addressLine1 ?? '',
      addressLine2: address.addressLine2 ?? '',
      city: address.city ?? '',
      state: address.state ?? '',
      postalCode: address.postalCode ?? '',
      country: address.country ?? '',
      type: address.type ?? 'home',
    });
  };

  const handleSetDefault = async (address) => {
    setBusyId(address._id);

    try {
      await dispatch(editAddress({ addressId: address._id, address: { default: true } })).unwrap();
      toast.success('Default address updated.');
      dispatch(fetchAddresses());
    } catch (message) {
      toast.error(String(message));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (addressId) => {
    setBusyId(addressId);

    try {
      await dispatch(removeAddress(addressId)).unwrap();
      toast.success('Address removed.');
      if (editingId === addressId) resetForm();
      dispatch(fetchAddresses());
    } catch (message) {
      toast.error(String(message));
    } finally {
      setBusyId(null);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-3xl border border-border bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-medium text-primary">Saved addresses</h2>
            <p className="mt-0.5 text-xs text-muted">
              These come from GET /addresses. The default address is the one checkout
              offers first.
            </p>
          </div>

          {items.length > 0 && (
            <span className="rounded-full border border-border px-3 py-1 text-[11px] text-muted">
              {items.length} saved
            </span>
          )}
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
            {error}
          </p>
        )}

        {loading && items.length === 0 ? (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2" aria-busy="true">
            {Array.from({ length: 2 }).map((_, index) => (
              <li key={index} className="h-40 animate-pulse rounded-3xl border border-border bg-peach/25" />
            ))}
          </ul>
        ) : items.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-border bg-background px-4 py-8 text-center text-sm text-muted">
            No addresses saved yet. Add one below — it becomes your default address.
          </p>
        ) : (
          // Two cards per row from sm, so a pair of addresses reads at a glance
          // instead of stacking into one long column.
          <ul className="mt-4 grid items-stretch gap-3 sm:grid-cols-2">
            {items.map((address) => {
              const Icon = typeIcon(address.type);
              const busy = busyId === address._id;
              const editing = editingId === address._id;

              return (
                <li
                  key={address._id}
                  className={[
                    'flex flex-col rounded-3xl border p-4 transition-all duration-200 sm:p-5',
                    address.default
                      ? 'border-accent bg-peach/20'
                      : 'border-border bg-white hover:border-accent/40',
                    editing ? 'ring-2 ring-accent/30' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <div className="flex min-w-0 flex-1 items-start gap-3.5">
                    <span
                      aria-hidden="true"
                      className={[
                        'flex size-11 shrink-0 items-center justify-center rounded-2xl border transition-colors',
                        address.default
                          ? 'border-accent/40 bg-white text-accent'
                          : 'border-border bg-background text-muted',
                      ].join(' ')}
                    >
                      <Icon size={19} strokeWidth={1.8} />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-primary">
                        {typeLabel(address.type)}

                        {address.default && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                            <Star size={10} strokeWidth={2} aria-hidden="true" />
                            Default
                          </span>
                        )}

                        {editing && (
                          <span className="rounded-full border border-accent/40 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                            Editing
                          </span>
                        )}
                      </p>

                      <p className="mt-1.5 text-xs leading-5 text-muted">
                        {address.addressLine1}
                        {address.addressLine2 ? `, ${address.addressLine2}` : ''}
                        <br />
                        {address.city}, {address.state} {address.postalCode}
                        <br />
                        {address.country}
                      </p>
                    </div>
                  </div>

                  {/* Pinned to the bottom so a grid of cards lines its buttons up. */}
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/70 pt-3.5">
                    <button
                      type="button"
                      onClick={() => handleEdit(address)}
                      className={`${ACTION_BUTTON} border-border text-primary hover:border-accent hover:text-accent`}
                    >
                      <Pencil size={13} strokeWidth={1.8} aria-hidden="true" />
                      Edit
                    </button>

                    {!address.default && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleSetDefault(address)}
                        className={`${ACTION_BUTTON} border-border text-primary hover:border-accent hover:text-accent`}
                      >
                        <Star size={13} strokeWidth={1.8} aria-hidden="true" />
                        Set default
                      </button>
                    )}

                    {confirmDeleteId === address._id ? (
                      <span className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleDelete(address._id)}
                          className="inline-flex min-h-9 items-center rounded-full bg-red-700 px-3 text-xs font-semibold text-white transition-colors hover:bg-red-800 disabled:opacity-45"
                        >
                          Delete for good
                        </button>

                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-xs font-medium text-muted transition-colors hover:text-primary"
                        >
                          Cancel
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setConfirmDeleteId(address._id)}
                        className="inline-flex min-h-9 items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:opacity-45"
                      >
                        <Trash2 size={13} strokeWidth={1.9} aria-hidden="true" />
                        Delete
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-3xl border border-border bg-white p-5 sm:p-6"
      >
        <h2 className="text-base font-medium text-primary">
          {editingId ? 'Edit address' : 'Add a new address'}
        </h2>
        <p className="mt-0.5 text-xs text-muted">
          Saved with {editingId ? 'PATCH /addresses/:id' : 'POST /addresses'}. Fields marked
          “required” match the server validation.
        </p>

        {/* Type first: it is the one choice the rest of the form describes. */}
        <fieldset className="mt-5">
          <legend className="text-sm font-medium text-primary">Address type</legend>
          <p className="mt-0.5 text-xs text-muted">
            Pick where this address belongs. It is saved with the address and shown on
            this page and at checkout.
          </p>

          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {TYPE_OPTIONS.map(({ value, label, hint, Icon }) => {
              const checked = values.type === value;

              return (
                <label
                  key={value}
                  className={[
                    'flex cursor-pointer items-center gap-3 rounded-2xl border p-3.5 transition-all duration-200',
                    checked
                      ? 'border-accent bg-peach/25 shadow-[0_16px_32px_-24px_rgba(122,46,31,0.65)]'
                      : 'border-border bg-white hover:border-accent/45 hover:bg-peach/10',
                  ].join(' ')}
                >
                  <input
                    type="radio"
                    name="address-type"
                    value={value}
                    checked={checked}
                    onChange={handleChange('type')}
                    className="size-4 shrink-0 cursor-pointer accent-[#C0563A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  />

                  <span
                    aria-hidden="true"
                    className={[
                      'flex size-10 shrink-0 items-center justify-center rounded-xl border transition-colors',
                      checked
                        ? 'border-accent/40 bg-white text-accent'
                        : 'border-border bg-background text-muted',
                    ].join(' ')}
                  >
                    <Icon size={18} strokeWidth={1.8} />
                  </span>

                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-primary">{label}</span>
                    <span className="block text-[11px] leading-4 text-muted">{hint}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-5 flex flex-col gap-4">
          <AuthField
            label="Address line 1"
            name="address-line-1"
            icon={MapPin}
            value={values.addressLine1}
            onChange={handleChange('addressLine1')}
            error={fieldErrors.addressLine1}
            required
          />

          <AuthField
            label="Address line 2"
            name="address-line-2"
            value={values.addressLine2}
            onChange={handleChange('addressLine2')}
            error={fieldErrors.addressLine2}
            hint="Flat, building or landmark. Optional."
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <AuthField
              label="City"
              name="address-city"
              value={values.city}
              onChange={handleChange('city')}
              error={fieldErrors.city}
              required
            />

            <AuthField
              label="State"
              name="address-state"
              value={values.state}
              onChange={handleChange('state')}
              error={fieldErrors.state}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <AuthField
              label="Postal code"
              name="address-postal-code"
              value={values.postalCode}
              onChange={handleChange('postalCode')}
              error={fieldErrors.postalCode}
              required
            />

            <AuthField
              label="Country"
              name="address-country"
              value={values.country}
              onChange={handleChange('country')}
              error={fieldErrors.country}
              required
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button type="submit" variant="primary" loading={loading} disabled={loading}>
            <Plus size={16} strokeWidth={1.8} aria-hidden="true" />
            {editingId ? 'Save address' : 'Add address'}
          </Button>

          {editingId && (
            <Button type="button" variant="ghost" onClick={resetForm}>
              Cancel edit
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
