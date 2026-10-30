import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AlertTriangle, CheckCircle2, Send } from 'lucide-react';

import AuthField from '../auth/AuthField';
import Button from '../common/Button';
import { getContent } from '../../data/content';
import { sendContactMessage } from '../../slices/contactSlice';

// The title, the description and the button labels come from
// src/data/siteContent.json (key "contact.form"). Field placeholders and the
// validation messages stay in this file, because they are form behaviour.
//
// Submitting dispatches POST /api/contact: the server stores the message and
// emails the studio inbox. The browser never talks to the mail server itself.

const initialValues = {
  name: '',
  email: '',
  message: '',
};

const form = getContent('contact.form', {});

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validate = (values) => {
  const errors = {};

  if (!values.name.trim()) {
    errors.name = 'Please enter your name.';
  } else if (values.name.trim().length < 2) {
    errors.name = 'Please enter at least 2 characters.';
  }

  if (!values.email.trim()) {
    errors.email = 'Please enter your email address.';
  } else if (!emailPattern.test(values.email.trim())) {
    errors.email = 'Enter a valid email, for example name@example.com.';
  }

  if (!values.message.trim()) {
    errors.message = 'Please tell us how we can help.';
  } else if (values.message.trim().length < 10) {
    errors.message = 'Please add a little more detail (10 characters or more).';
  }

  return errors;
};

export default function ContactFormCard() {
  const dispatch = useDispatch();
  const { sending } = useSelector((state) => state.contact);

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);

  const handleChange = (field) => (event) => {
    const { value } = event.target;

    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setStatus(null);
  };

  const handleBlur = (field) => () => {
    const fieldErrors = validate(values);

    setErrors((current) => ({ ...current, [field]: fieldErrors[field] }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setStatus({
        tone: 'error',
        text: 'Please fix the highlighted fields and try again.',
      });
      return;
    }

    try {
      const result = await dispatch(sendContactMessage(values)).unwrap();

      setValues(initialValues);
      setStatus({ tone: 'success', text: result.message });
    } catch (error) {
      setStatus({
        tone: 'error',
        text:
          typeof error === 'string'
            ? error
            : 'We could not send your message just now. Please try again.',
      });
    }
  };

  const handleReset = () => {
    setValues(initialValues);
    setErrors({});
    setStatus(null);
  };

  return (
    <div id="contact-form" className="scroll-mt-24">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-3xl border border-border bg-white p-6 shadow-[0_18px_60px_rgba(122,46,31,0.08)] sm:p-8 sm:pb-9"
      >
        <div className="max-w-md">
          <h2 className="font-serif text-2xl font-medium tracking-tight text-primary sm:text-3xl">
            {form.title}
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted">
            {form.description}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-5">
          <AuthField
            label="Your name"
            name="contact-name"
            required
            value={values.name}
            onChange={handleChange('name')}
            onBlur={handleBlur('name')}
            error={errors.name}
            placeholder="e.g. Priya Sharma"
            autoComplete="name"
          />

          <AuthField
            label="Email address"
            name="contact-email"
            type="email"
            required
            value={values.email}
            onChange={handleChange('email')}
            onBlur={handleBlur('email')}
            error={errors.email}
            placeholder="you@example.com"
            autoComplete="email"
          />

          <div className="flex w-full flex-col gap-1.5">
            <label
              htmlFor="contact-message"
              className="text-sm font-medium text-primary"
            >
              Message
              <span className="text-accent"> *</span>
            </label>

            <textarea
              id="contact-message"
              name="contact-message"
              rows={5}
              required
              value={values.message}
              onChange={handleChange('message')}
              onBlur={handleBlur('message')}
              placeholder="Share your order number, the product you are asking about, or any other detail that helps us help you."
              aria-invalid={Boolean(errors.message)}
              aria-describedby={
                errors.message ? 'contact-message-error' : 'contact-message-hint'
              }
              className={[
                'w-full resize-y rounded-xl border bg-white px-4 py-3 text-sm text-primary outline-none transition',
                'placeholder:text-muted focus-within:ring-4',
                errors.message
                  ? 'border-red-400 focus:ring-red-100'
                  : 'border-border focus:border-accent focus:ring-accent/15',
              ].join(' ')}
            />

            {errors.message ? (
              <p id="contact-message-error" className="text-xs text-red-600">
                {errors.message}
              </p>
            ) : (
              <p id="contact-message-hint" className="text-xs text-muted">
                Include your order number if you have one — it helps us answer
                faster. Prefer to talk? Call the studio using the number beside
                this form.
              </p>
            )}
          </div>
        </div>

        {status && (
          <p
            role="status"
            className={[
              'mt-6 flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-xs leading-5 sm:text-[13px]',
              status.tone === 'error'
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-accent/30 bg-peach/25 text-primary',
            ].join(' ')}
          >
            {status.tone === 'error' ? (
              <AlertTriangle
                size={16}
                strokeWidth={1.9}
                aria-hidden="true"
                className="mt-0.5 shrink-0"
              />
            ) : (
              <CheckCircle2
                size={16}
                strokeWidth={1.9}
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-accent"
              />
            )}

            <span>{status.text}</span>
          </p>
        )}

        <div className="mt-7 flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={sending}
          className="min-w-[200px] gap-3 rounded-full text-[12px] font-semibold uppercase tracking-[0.18em]"
        >
          {form.submitLabel}
          <Send size={17} strokeWidth={1.8} aria-hidden="true" />
        </Button>

          <Button type="button" variant="ghost" size="lg" onClick={handleReset}>
            {form.resetLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}
