import { useEffect, useMemo, useState } from 'react';
import { ImageOff, X } from 'lucide-react';

import { ACCEPTED_TYPES, MAX_GALLERY, fileProblem } from '../../utils/productImages';
import { colourSwatch } from '../../utils/colourSwatches';
import { variantImageGroups } from '../../utils/variants';

// The Images step of the create-product wizard: the product photo, its gallery
// and one photo per colour (one per combination when there is no colour), all
// chosen before anything is saved. The editor uploads them straight after the
// product is created, so nobody has to come back to a second screen to attach
// variant photos.
//
// Files are held in the form's state, not uploaded here: there is no product id
// yet. Previews are object URLs owned by FilePreview, which revokes them when the
// chosen file changes or the step unmounts.
const SWATCH_FALLBACK = '#D9CEC4';

function FilePreview({ file, alt = '' }) {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  // Revoke the previous URL when the file changes, and the last one on unmount,
  // so the browser never keeps a file the step has moved on from.
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );

  if (!url) return null;

  return <img src={url} alt={alt} className="h-full w-full object-cover" />;
}

export default function AdminProductImageStep({
  variants = [],
  combinations = [],
  images,
  onChange,
  disabled = false,
}) {
  const [message, setMessage] = useState(null);

  const groups = variantImageGroups(variants, combinations);
  const gallery = images.galleryImages;
  const remaining = MAX_GALLERY - gallery.length;

  const pickMain = (event) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = '';

    const problem = fileProblem(file);
    if (problem) {
      setMessage({ tone: 'error', text: problem });
      return;
    }

    onChange({ ...images, mainImage: file });
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

    onChange({ ...images, galleryImages: [...gallery, ...files] });
    setMessage(null);
  };

  const pickVariant = (key, event) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = '';

    const problem = fileProblem(file);
    if (problem) {
      setMessage({ tone: 'error', text: problem });
      return;
    }

    onChange({ ...images, variantImages: { ...images.variantImages, [key]: file } });
    setMessage(null);
  };

  const clearVariant = (key) => {
    const next = { ...images.variantImages };
    delete next[key];
    onChange({ ...images, variantImages: next });
  };

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-2xl border border-border bg-background p-4">
        <h3 className="text-sm font-medium text-primary">Product photo</h3>
        <p className="mt-1 text-xs leading-5 text-muted">
          The one photo used on cards, in the cart and at the top of the product
          page. AVIF, GIF, JPEG, PNG or WebP, up to 5 MB.
        </p>

        <div className="mt-3 flex items-start gap-4">
          <span className="flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-white">
            {images.mainImage ? (
              <FilePreview file={images.mainImage} />
            ) : (
              <ImageOff size={20} strokeWidth={1.5} aria-hidden="true" className="text-muted" />
            )}
          </span>

          <div className="min-w-0 flex-1">
            <input
              id="admin-product-step-main-image"
              type="file"
              accept={ACCEPTED_TYPES.join(',')}
              disabled={disabled}
              onChange={pickMain}
              aria-label="Product photo"
              className="w-full text-[11px] text-muted file:mr-2 file:min-h-8 file:rounded-full file:border file:border-border file:bg-white file:px-3 file:text-[11px] file:font-medium file:text-primary"
            />

            {images.mainImage && (
              <p className="mt-2 text-[11px] text-muted">
                {images.mainImage.name}
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange({ ...images, mainImage: null })}
                  className="ml-1 font-semibold text-red-700 disabled:opacity-45"
                >
                  remove
                </button>
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-background p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-medium text-primary">
            Gallery images ({gallery.length}/{MAX_GALLERY})
          </h3>

          <p className="text-[11px] text-muted">
            {remaining > 0 ? `${remaining} slot${remaining === 1 ? '' : 's'} free` : 'Gallery full'}
          </p>
        </div>

        <p className="mt-1 text-xs leading-5 text-muted">
          The rest of the product page gallery, in the order you add them here.
        </p>

        {gallery.length > 0 && (
          <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {gallery.map((file, index) => (
              <li key={`${file.name}-${index}`} className="relative">
                <span className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-border bg-white">
                  <FilePreview file={file} />
                </span>

                <button
                  type="button"
                  disabled={disabled}
                  onClick={() =>
                    onChange({
                      ...images,
                      galleryImages: gallery.filter((_, itemIndex) => itemIndex !== index),
                    })
                  }
                  aria-label={`Remove gallery image ${index + 1}`}
                  className="absolute -right-1.5 -top-1.5 flex size-6 items-center justify-center rounded-full border border-red-200 bg-white text-red-700 transition-colors hover:bg-red-50 disabled:opacity-45"
                >
                  <X size={12} strokeWidth={2.2} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <label
          htmlFor="admin-product-step-gallery"
          className="mt-3 block text-xs font-medium text-primary"
        >
          Add gallery images (select several at once)
        </label>

        <input
          id="admin-product-step-gallery"
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(',')}
          disabled={disabled || remaining === 0}
          onChange={pickGallery}
          className="mt-1 w-full text-[11px] text-muted file:mr-2 file:min-h-8 file:rounded-full file:border file:border-border file:bg-white file:px-3 file:text-[11px] file:font-medium file:text-primary"
        />
      </section>

      <section className="rounded-2xl border border-border bg-background p-4">
        <h3 className="text-sm font-medium text-primary">
          {groups.length > 0 ? 'Variant photos' : 'Variant photos (none yet)'}
        </h3>

        {groups.length > 0 ? (
          <>
            <p className="mt-1 text-xs leading-5 text-muted">
              One photo per {groups[0].variantNames.length > 1 ? 'colour' : 'combination'} — it
              is attached to every combination it covers, so the same file is not
              picked again for each size. Everything uploads together when you
              create the product.
            </p>

            <ul className="mt-3 flex flex-col gap-2">
              {groups.map((group) => {
                const file = images.variantImages[group.key] ?? null;
                const shade = colourSwatch(group.label);

                return (
                  <li
                    key={group.key}
                    className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-white p-2.5"
                  >
                    <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border">
                      {file ? (
                        <FilePreview file={file} alt={group.label} />
                      ) : (
                        <span
                          aria-hidden="true"
                          className="block size-full"
                          style={{ backgroundColor: shade ?? SWATCH_FALLBACK }}
                        />
                      )}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-primary">{group.label}</p>
                      <p className="truncate text-[11px] text-muted">
                        {group.variantNames.length > 1
                          ? `${group.variantNames.length} combinations`
                          : group.variantNames[0]}
                      </p>

                      {file && (
                        <p className="mt-0.5 truncate text-[11px] text-muted">
                          {file.name}
                          <button
                            type="button"
                            disabled={disabled}
                            onClick={() => clearVariant(group.key)}
                            className="ml-1 font-semibold text-red-700 disabled:opacity-45"
                          >
                            remove
                          </button>
                        </p>
                      )}
                    </div>

                    <input
                      type="file"
                      accept={ACCEPTED_TYPES.join(',')}
                      disabled={disabled}
                      onChange={(event) => pickVariant(group.key, event)}
                      aria-label={`Photo for ${group.label}`}
                      className="w-52 text-[11px] text-muted file:mr-2 file:min-h-8 file:rounded-full file:border file:border-border file:bg-white file:px-3 file:text-[11px] file:font-medium file:text-primary"
                    />
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <p className="mt-1 text-xs leading-5 text-muted">
            Add variants on the Details step and each colour gets its own photo
            slot here.
          </p>
        )}
      </section>

      {message && (
        <p
          role={message.tone === 'error' ? 'alert' : 'status'}
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700"
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
