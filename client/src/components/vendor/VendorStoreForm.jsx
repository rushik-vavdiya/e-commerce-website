import { useState } from 'react';

import AuthField from '../auth/AuthField';
import Button from '../common/Button';

// Store details form for one of the two endpoints that accept the same fields:
// POST /vendors (a customer applying to sell) and PATCH /vendors/me (an approved
// vendor editing the store). Only the fields the API accepts are sent, and the
// wording differs, so the copy comes in as props.
export default function VendorStoreForm({
  initial = null,
  onSubmit,
  busy = false,
  error = null,
  title = 'Edit store profile',
  description = 'These details are shown to admins during review and to customers on your store pages.',
  submitLabel = 'Save store profile',
  successMessage = 'Store profile saved.',
}) {
  const [values, setValues] = useState({
    storeName: initial?.storeName ?? '',
    storeDescription: initial?.storeDescription ?? '',
    storeAddress: initial?.storeAddress ?? '',
    storeContact: initial?.storeContact ?? '',
    storeEmail: initial?.storeEmail ?? '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [notice, setNotice] = useState(null);

  const handleChange = (field) => (event) => {
    const { value } = event.target;
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setNotice(null);

    const nextErrors = {};

    if (values.storeName.trim().length < 2) nextErrors.storeName = 'Use at least 2 characters.';
    if (values.storeDescription.trim().length < 10) {
      nextErrors.storeDescription = 'Please write at least 10 characters.';
    }
    if (values.storeAddress.trim().length < 5) nextErrors.storeAddress = 'Use at least 5 characters.';
    if (values.storeContact.trim().length < 10) {
      nextErrors.storeContact = 'Use 10 to 20 characters for the store contact.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.storeEmail.trim())) {
      nextErrors.storeEmail = 'Enter a valid email address.';
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await onSubmit?.({
        storeName: values.storeName.trim(),
        storeDescription: values.storeDescription.trim(),
        storeAddress: values.storeAddress.trim(),
        storeContact: values.storeContact.trim(),
        storeEmail: values.storeEmail.trim(),
      });
      setNotice({ tone: 'success', text: successMessage });
    } catch (message) {
      setNotice({ tone: 'error', text: String(message) });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-3xl border border-border bg-white p-5 sm:p-6"
    >
      <h2 className="text-base font-medium text-primary">{title}</h2>
      <p className="mt-0.5 text-xs text-muted">{description}</p>

      <div className="mt-5 flex flex-col gap-4">
        <AuthField
          label="Store name"
          name="store-name"
          value={values.storeName}
          onChange={handleChange('storeName')}
          error={fieldErrors.storeName}
          required
        />

        <div className="flex w-full flex-col gap-1.5">
          <label htmlFor="store-description" className="text-sm font-medium text-primary">
            Store description
            <span className="text-accent"> *</span>
          </label>

          <textarea
            id="store-description"
            rows={4}
            value={values.storeDescription}
            onChange={handleChange('storeDescription')}
            aria-invalid={Boolean(fieldErrors.storeDescription)}
            className="w-full resize-y rounded-xl border border-border bg-white px-4 py-3 text-sm text-primary outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/15"
          />

          {fieldErrors.storeDescription && (
            <p className="text-xs text-red-600">{fieldErrors.storeDescription}</p>
          )}
        </div>

        <AuthField
          label="Store address"
          name="store-address"
          value={values.storeAddress}
          onChange={handleChange('storeAddress')}
          error={fieldErrors.storeAddress}
          required
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <AuthField
            label="Store contact number"
            name="store-contact"
            type="tel"
            value={values.storeContact}
            onChange={handleChange('storeContact')}
            error={fieldErrors.storeContact}
            required
          />

          <AuthField
            label="Store email"
            name="store-email"
            type="email"
            value={values.storeEmail}
            onChange={handleChange('storeEmail')}
            error={fieldErrors.storeEmail}
            required
          />
        </div>
      </div>

      {(notice?.tone === 'error' || error) && (
        <p role="alert" className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {error || notice.text}
        </p>
      )}

      {notice?.tone === 'success' && (
        <p role="status" className="mt-5 rounded-2xl border border-peach bg-peach/30 px-4 py-3 text-xs text-primary">
          {notice.text}
        </p>
      )}

      <div className="mt-5">
        <Button type="submit" variant="primary" loading={busy} disabled={busy}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
