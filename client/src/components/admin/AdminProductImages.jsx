import { useEffect, useMemo, useState } from 'react';
import { ImageOff, Upload, X } from 'lucide-react';

import Button from '../common/Button';
import UploadSpinner from '../common/UploadSpinner';
// The rules the API applies to a product image, shared with the create wizard's
// Images step so both pickers accept exactly the same files.
import { ACCEPTED_TYPES, MAX_GALLERY, fileProblem } from '../../utils/productImages';

// One main image plus a gallery of up to ten. The API takes both in a single
// multipart PUT /products/:id/images request, so this panel keeps the chosen
// files in local state and sends them together with the upload button.
export default function AdminProductImages({
  product,
  onUpload,
  onDeleteMain,
  onDeleteGallery,
  busy: parentBusy = false,
  disabled = false,
  error = null,
}) {
  const [pendingMain, setPendingMain] = useState(null);
  const [pendingGallery, setPendingGallery] = useState([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  const gallery = product?.galleryImages ?? [];
  const remaining = MAX_GALLERY - gallery.length;
  const locked = disabled || parentBusy || busy;

  // Local preview of the picked main image; the object URL is revoked when the
  // choice changes so the browser does not keep the file in memory.
  const previewMain = useMemo(
    () => (pendingMain ? URL.createObjectURL(pendingMain) : null),
    [pendingMain],
  );

  useEffect(() => () => {
    if (previewMain) URL.revokeObjectURL(previewMain);
  }, [previewMain]);

  const pickMain = (event) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = '';

    const problem = fileProblem(file);
    if (problem) {
      setMessage({ tone: 'error', text: problem });
      return;
    }

    setPendingMain(file);
    setMessage(null);
  };

  const pickGallery = (event) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';

    if (files.length === 0) return;

    const problems = files.map(fileProblem).filter(Boolean);
    if (problems.length > 0) {
      setMessage({ tone: 'error', text: problems.join(' ') });
      return;
    }

    if (files.length > remaining) {
      setMessage({
        tone: 'error',
        text: `Only ${remaining} more gallery ${
          remaining === 1 ? 'image fits' : 'images fit'
        } (the API allows ${MAX_GALLERY}).`,
      });
      return;
    }

    setPendingGallery(files);
    setMessage(null);
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!pendingMain && pendingGallery.length === 0) {
      setMessage({ tone: 'error', text: 'Choose a main image, gallery images, or both.' });
      return;
    }

    setBusy(true);
    setMessage(null);

    try {
      await onUpload?.({ mainImage: pendingMain, galleryImages: pendingGallery });
      setPendingMain(null);
      setPendingGallery([]);
      setMessage({
        tone: 'success',
        text:
          pendingGallery.length > 0
            ? `${pendingGallery.length + (pendingMain ? 1 : 0)} image${
                pendingGallery.length + (pendingMain ? 1 : 0) === 1 ? '' : 's'
              } uploaded.`
            : 'Main image uploaded.',
      });
    } catch (uploadError) {
      setMessage({ tone: 'error', text: String(uploadError) });
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (kind, index) => {
    setBusy(true);
    setMessage(null);

    try {
      if (kind === 'main') {
        await onDeleteMain?.();
        setMessage({ tone: 'success', text: 'Main image removed.' });
      } else {
        await onDeleteGallery?.(index);
        setMessage({ tone: 'success', text: 'Gallery image removed.' });
      }
    } catch (deleteError) {
      setMessage({ tone: 'error', text: String(deleteError) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={handleUpload}
      className="rounded-3xl border border-border bg-white p-5 sm:p-6"
    >
      <h2 className="text-base font-medium text-primary">Images</h2>

      <p className="mt-1 text-xs leading-5 text-muted">
        One main image (used on cards and in the cart) and up to {MAX_GALLERY}{' '}
        gallery images (the product page gallery). AVIF, GIF, JPEG, PNG or WebP,
        up to 5 MB each.
      </p>

      {disabled && (
        <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
          Save the product first. Images are attached to a saved product
          (PUT /products/:id/images), so this panel opens on the edit page.
        </p>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-[10rem_1fr]">
        <div className="rounded-2xl border border-border bg-background p-3">
          <p className="text-xs font-semibold text-primary">Main image</p>

          <span className="relative mt-2 flex h-28 items-center justify-center overflow-hidden rounded-xl border border-border bg-white">
            {pendingMain || product?.mainImage ? (
              <img
                src={previewMain ?? product.mainImage}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageOff size={20} strokeWidth={1.5} aria-hidden="true" className="text-muted" />
            )}

            {busy && <UploadSpinner size={20} />}
          </span>

          {product?.mainImage && (
            <button
              type="button"
              disabled={locked}
              onClick={() => handleDelete('main')}
              className="mt-2 text-xs font-semibold text-red-700 transition-colors hover:text-red-800 disabled:opacity-45"
            >
              Remove
            </button>
          )}

          <input
            id="admin-product-main-image"
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            disabled={locked}
            onChange={pickMain}
            className="mt-2 w-full text-[11px] text-muted file:mr-2 file:min-h-8 file:rounded-full file:border file:border-border file:bg-white file:px-3 file:text-[11px] file:font-medium file:text-primary"
          />

          {pendingMain && (
            <p className="mt-1 text-[11px] text-muted">
              New: {pendingMain.name}
              <button
                type="button"
                onClick={() => setPendingMain(null)}
                className="ml-1 font-semibold text-red-700"
              >
                remove
              </button>
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-background p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold text-primary">
              Gallery images ({gallery.length}/{MAX_GALLERY})
            </p>

            <p className="text-[11px] text-muted">
              {remaining > 0 ? `${remaining} slot${remaining === 1 ? '' : 's'} free` : 'Gallery full'}
            </p>
          </div>

          {gallery.length > 0 ? (
            <div className="relative mt-2 rounded-xl">
              <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {gallery.map((url, index) => (
                  <li key={`${url}-${index}`} className="relative">
                    <span className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-border bg-white">
                      <img src={url} alt="" className="h-full w-full object-cover" />
                    </span>

                    <button
                      type="button"
                      disabled={locked}
                      onClick={() => handleDelete('gallery', index)}
                      aria-label={`Remove gallery image ${index + 1}`}
                      className="absolute -right-1.5 -top-1.5 flex size-6 items-center justify-center rounded-full border border-red-200 bg-white text-red-700 transition-colors hover:bg-red-50 disabled:opacity-45"
                    >
                      <X size={12} strokeWidth={2.2} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>

              {busy && <UploadSpinner size={20} label="Uploading images" />}
            </div>
          ) : (
            <p className="mt-2 text-xs text-muted">
              No gallery images yet.
            </p>
          )}

          <label
            htmlFor="admin-product-gallery-images"
            className="mt-3 block text-xs font-medium text-primary"
          >
            Add gallery images (select several at once)
          </label>

          <input
            id="admin-product-gallery-images"
            type="file"
            multiple
            accept={ACCEPTED_TYPES.join(',')}
            disabled={locked || remaining === 0}
            onChange={pickGallery}
            className="mt-1 w-full text-[11px] text-muted file:mr-2 file:min-h-8 file:rounded-full file:border file:border-border file:bg-white file:px-3 file:text-[11px] file:font-medium file:text-primary"
          />

          {pendingGallery.length > 0 && (
            <p className="mt-2 text-[11px] text-muted">
              Selected {pendingGallery.length}: {pendingGallery.map((file) => file.name).join(', ')}
              <button
                type="button"
                onClick={() => setPendingGallery([])}
                className="ml-1 font-semibold text-red-700"
              >
                clear
              </button>
            </p>
          )}
        </div>
      </div>

      {(message || error) && (
        <p
          role={message?.tone === 'error' ? 'alert' : 'status'}
          className={[
            'mt-4 rounded-2xl border px-4 py-3 text-xs',
            message?.tone === 'error' || error
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-peach bg-peach/30 text-primary',
          ].join(' ')}
        >
          {message?.tone === 'error' ? message.text : (message?.text ?? error)}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          variant="primary"
          loading={busy}
          disabled={locked || (!pendingMain && pendingGallery.length === 0)}
        >
          <Upload size={15} strokeWidth={1.8} aria-hidden="true" />
          Upload selected images
        </Button>

        <Button
          type="button"
          variant="ghost"
          disabled={locked || (!pendingMain && pendingGallery.length === 0)}
          onClick={() => {
            setPendingMain(null);
            setPendingGallery([]);
            setMessage(null);
          }}
        >
          Clear selection
        </Button>
      </div>
    </form>
  );
}
