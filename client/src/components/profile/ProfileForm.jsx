import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ImageOff, Upload, User } from 'lucide-react';

import AuthField from '../auth/AuthField';
import Button from '../common/Button';
import UploadSpinner from '../common/UploadSpinner';
import {
  fetchMe,
  removeProfilePicture,
  updateMyProfile,
  uploadProfilePicture,
} from '../../slices/userSlice';
import { updateSessionUser } from '../../slices/authSlice';
import { useToast } from '../notifications';

// Personal information. PATCH /users/me accepts firstName, lastName, gender,
// birthDate and phone — the email address is not editable through the API, so the
// field is shown read-only. There is no phone-verification endpoint, which the
// note under the phone field says.
//
// The form fields live in a keyed child component: the key changes when the
// profile identity arrives, so the inputs are initialised from the server values
// without writing state from an effect. Saving reports through a toast, so the
// key must not change on every server write.
export default function ProfileForm() {
  const dispatch = useDispatch();

  const profile = useSelector((state) => state.user.profile);
  const sessionUser = useSelector((state) => state.auth.user);
  const { loading } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  const initial = profile ?? sessionUser ?? null;

  return (
    // The key follows the fetched profile, not the cached session user: they share
    // an id, so keying on `initial` alone left the fields filled from the session
    // snapshot and a value that only exists on the server (for example a birth
    // date saved elsewhere) never reached the inputs.
    <ProfileFields
      key={profile?._id ?? 'session'}
      initial={initial}
      loading={loading}
    />
  );
}

function ProfileFields({ initial, loading }) {
  const dispatch = useDispatch();
  const toast = useToast();

  const [values, setValues] = useState({
    firstName: initial?.firstName ?? '',
    lastName: initial?.lastName ?? '',
    phone: initial?.phone ?? '',
    gender: initial?.gender ?? '',
    birthDate: initial?.birthDate ? String(initial.birthDate).slice(0, 10) : '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  // Drives the spinner over the avatar while the file is actually uploading.
  const [pictureBusy, setPictureBusy] = useState(false);

  const handleChange = (field) => (event) => {
    const { value } = event.target;
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = {};

    if (values.firstName.trim().length < 2) nextErrors.firstName = 'Use at least 2 characters.';
    if (values.lastName.trim().length < 2) nextErrors.lastName = 'Use at least 2 characters.';
    if (!/^\+?[0-9]{10,15}$/.test(values.phone.trim())) {
      nextErrors.phone = 'Use 10 to 15 digits, optionally starting with +.';
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    // Only first name, last name and phone carry a value the profile must have.
    // Gender and birth date are optional and are always sent, with null for an
    // empty field: the server unsets them, so clearing one is saved instead of
    // leaving the old value behind.
    const payload = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      phone: values.phone.trim(),
      gender: values.gender || null,
      birthDate: values.birthDate || null,
    };

    try {
      const response = await dispatch(updateMyProfile(payload)).unwrap();
      // The thunk resolves to the whole response body, so the saved user sits in
      // `data` — the same document the login flow stores as the session user.
      // Keeping the shared session user (header, dashboards) in step depends on
      // reading it from there; spreading the undefined top-level fields would
      // blank the stored name and phone instead.
      dispatch(updateSessionUser(response?.data ?? response));
      toast.success('Profile updated.');
    } catch (message) {
      toast.error(String(message));
    }
  };

  const handlePicture = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setPictureBusy(true);

    try {
      await dispatch(uploadProfilePicture(file)).unwrap();
      await dispatch(fetchMe());
      toast.success('Profile picture updated.');
    } catch (message) {
      toast.error(String(message));
    } finally {
      setPictureBusy(false);
    }
  };

  const handleRemovePicture = async () => {
    try {
      await dispatch(removeProfilePicture()).unwrap();
      toast.success('Profile picture removed.');
    } catch (message) {
      toast.error(String(message));
    }
  };

  return (
    <section className="flex flex-col gap-6">
      <div className="rounded-3xl border border-border bg-white p-5 sm:p-6">
        <h2 className="text-base font-medium text-primary">Profile picture</h2>
        <p className="mt-0.5 text-xs text-muted">
          Images are stored on Cloudinary through PUT /users/me/profile-picture.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <span className="relative flex size-20 items-center justify-center overflow-hidden rounded-full border border-border bg-peach/30">
            {initial?.profilePicture ? (
              <img
                src={initial.profilePicture}
                alt="Your profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageOff size={22} strokeWidth={1.5} aria-hidden="true" className="text-muted" />
            )}

            {pictureBusy && <UploadSpinner size={18} />}
          </span>

          <div className="flex flex-wrap items-center gap-3">
            <label
              className={`inline-flex min-h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-accent ${
                pictureBusy ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
              }`}
            >
              <Upload size={16} strokeWidth={1.8} aria-hidden="true" />
              {pictureBusy ? 'Uploading…' : 'Upload picture'}
              <input
                type="file"
                accept="image/avif,image/gif,image/jpeg,image/png,image/webp"
                disabled={pictureBusy}
                onChange={handlePicture}
                className="sr-only"
              />
            </label>

            {initial?.profilePicture && (
              <Button type="button" variant="outline" onClick={handleRemovePicture}>
                Remove picture
              </Button>
            )}
          </div>
        </div>

      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-3xl border border-border bg-white p-5 sm:p-6"
      >
        <h2 className="text-base font-medium text-primary">Personal information</h2>
        <p className="mt-0.5 text-xs text-muted">
          These values come from GET /users/me and are saved with PATCH /users/me.
        </p>

        <div className="mt-5 flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <AuthField
              label="First name"
              name="profile-first-name"
              icon={User}
              value={values.firstName}
              onChange={handleChange('firstName')}
              error={fieldErrors.firstName}
              required
            />

            <AuthField
              label="Last name"
              name="profile-last-name"
              value={values.lastName}
              onChange={handleChange('lastName')}
              error={fieldErrors.lastName}
              required
            />
          </div>

          <AuthField
            label="Email address"
            name="profile-email"
            value={initial?.email ?? ''}
            onChange={() => {}}
            disabled
            hint="Always required and set when the account was created, so it is not editable here."
          />

          <AuthField
            label="Phone number"
            name="profile-phone"
            type="tel"
            value={values.phone}
            onChange={handleChange('phone')}
            error={fieldErrors.phone}
            hint="Saved as-is. The API has no phone-verification step yet, so a change is not confirmed by SMS."
            required
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex w-full flex-col gap-1.5">
              <label htmlFor="profile-gender" className="text-sm font-medium text-primary">
                Gender
              </label>

              <select
                id="profile-gender"
                value={values.gender}
                onChange={handleChange('gender')}
                className="min-h-11 w-full rounded-xl border border-border bg-white px-4 text-sm text-primary outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/15"
              >
                <option value="">Prefer not to say</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>

              <p className="text-xs text-muted">Optional. “Prefer not to say” clears a saved value.</p>
            </div>

            <AuthField
              label="Birth date"
              name="profile-birth-date"
              type="date"
              value={values.birthDate}
              onChange={handleChange('birthDate')}
              hint="Optional. Clear the date to remove it."
            />
          </div>
        </div>

        <div className="mt-5">
          <Button type="submit" variant="primary" loading={loading} disabled={loading}>
            Save changes
          </Button>
        </div>
      </form>
    </section>
  );
}
