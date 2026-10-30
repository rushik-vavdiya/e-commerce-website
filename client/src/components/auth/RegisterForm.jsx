import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LockKeyhole, Mail, Phone, User } from 'lucide-react';

import Button from '../common/Button';
import { clearAuthError, registerUser } from '../../slices/authSlice';
import {
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PHONE_PATTERN,
  isEmail,
} from '../../utils/authHelpers';
import AuthAlert from './AuthAlert';
import AuthField from './AuthField';
import { getContent } from '../../data/content';
import { fill } from '../../utils/text';

// Wording lives in src/data/siteContent.json ("auth.register" and "auth.shared").
const copy = getContent('auth.register', {});
const shared = getContent('auth.shared', {});
const errorsCopy = copy.errors ?? {};

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  password: '',
  confirmPassword: '',
};

function RegisterForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState(initialForm);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  // Mirrors registerSchema on the server (which is strict about extra fields).
  const validate = () => {
    const nextErrors = {};

    if (formData.firstName.trim().length < NAME_MIN_LENGTH) {
      nextErrors.firstName = fill(errorsCopy.firstNameMin, { min: NAME_MIN_LENGTH });
    } else if (formData.firstName.trim().length > NAME_MAX_LENGTH) {
      nextErrors.firstName = fill(errorsCopy.firstNameMax, { max: NAME_MAX_LENGTH });
    }

    if (formData.lastName.trim().length < NAME_MIN_LENGTH) {
      nextErrors.lastName = fill(errorsCopy.lastNameMin, { min: NAME_MIN_LENGTH });
    } else if (formData.lastName.trim().length > NAME_MAX_LENGTH) {
      nextErrors.lastName = fill(errorsCopy.lastNameMax, { max: NAME_MAX_LENGTH });
    }

    if (!formData.email.trim()) {
      nextErrors.email = errorsCopy.emailRequired;
    } else if (!isEmail(formData.email)) {
      nextErrors.email = errorsCopy.emailInvalid;
    }

    if (!formData.phoneNumber.trim()) {
      nextErrors.phoneNumber = errorsCopy.phoneRequired;
    } else if (!PHONE_PATTERN.test(formData.phoneNumber.trim())) {
      nextErrors.phoneNumber = errorsCopy.phoneInvalid;
    }

    if (formData.password.length < PASSWORD_MIN_LENGTH) {
      nextErrors.password = fill(errorsCopy.passwordMin, { min: PASSWORD_MIN_LENGTH });
    } else if (formData.password.length > PASSWORD_MAX_LENGTH) {
      nextErrors.password = fill(errorsCopy.passwordMax, { max: PASSWORD_MAX_LENGTH });
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = errorsCopy.confirmRequired;
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = errorsCopy.mismatch;
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    dispatch(clearAuthError());

    const nextErrors = validate();

    if (!agreeToTerms) {
      nextErrors.terms = errorsCopy.terms;
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      // POST /auth/register expects exactly these five fields.
      const result = await dispatch(
        registerUser({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          password: formData.password,
        }),
      ).unwrap();

      navigate('/verify-email', {
        state: {
          email: formData.email.trim(),
          message: result.message,
          verificationEmailSent: result.verificationEmailSent,
        },
      });
    } catch {
      // The failure message is rendered from the Redux auth state below.
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AuthField
          label={copy.firstName}
          name="firstName"
          icon={User}
          placeholder={copy.firstNamePlaceholder}
          autoComplete="given-name"
          value={formData.firstName}
          onChange={handleChange}
          disabled={loading}
          error={fieldErrors.firstName}
          required
        />

        <AuthField
          label={copy.lastName}
          name="lastName"
          placeholder={copy.lastNamePlaceholder}
          autoComplete="family-name"
          value={formData.lastName}
          onChange={handleChange}
          disabled={loading}
          error={fieldErrors.lastName}
          required
        />
      </div>

      <AuthField
        label={shared.emailLabel}
        name="email"
        type="email"
        icon={Mail}
        placeholder={shared.emailPlaceholder}
        autoComplete="email"
        value={formData.email}
        onChange={handleChange}
        disabled={loading}
        error={fieldErrors.email}
        hint={copy.emailHint}
        required
      />

      <AuthField
        label={copy.phone}
        name="phoneNumber"
        type="tel"
        icon={Phone}
        placeholder={copy.phonePlaceholder}
        autoComplete="tel"
        value={formData.phoneNumber}
        onChange={handleChange}
        disabled={loading}
        error={fieldErrors.phoneNumber}
        required
      />

      <AuthField
        label={shared.passwordLabel}
        name="password"
        type="password"
        icon={LockKeyhole}
        reveal
        placeholder={copy.passwordPlaceholder}
        autoComplete="new-password"
        value={formData.password}
        onChange={handleChange}
        disabled={loading}
        error={fieldErrors.password}
        hint={fill(copy.passwordHint, { min: PASSWORD_MIN_LENGTH })}
        required
      />

      <AuthField
        label={copy.confirm}
        name="confirmPassword"
        type="password"
        icon={LockKeyhole}
        reveal
        placeholder={copy.confirmPlaceholder}
        autoComplete="new-password"
        value={formData.confirmPassword}
        onChange={handleChange}
        disabled={loading}
        error={fieldErrors.confirmPassword}
        required
      />

      <div className="flex flex-col gap-1">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            name="agreeToTerms"
            checked={agreeToTerms}
            onChange={(event) => setAgreeToTerms(event.target.checked)}
            className="mt-0.5 size-4 shrink-0 cursor-pointer rounded border-border accent-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          />
          <span className="text-sm leading-5 text-muted">{copy.terms}</span>
        </label>

        {fieldErrors.terms && <p className="text-xs text-red-600">{fieldErrors.terms}</p>}
      </div>

      {error && <AuthAlert variant="error">{error}</AuthAlert>}

      <Button type="submit" size="lg" fullWidth loading={loading} disabled={loading}>
        {copy.submit}
      </Button>

      <p className="text-center text-sm text-muted">
        {copy.haveAccount}{' '}
        <Link to="/login" className="font-semibold text-accent hover:underline">
          {copy.signIn}
        </Link>
      </p>
    </form>
  );
}

export default RegisterForm;
