import { useState } from 'react';
import { ImageOff, Layers, Upload } from 'lucide-react';

import Button from '../common/Button';
import UploadSpinner from '../common/UploadSpinner';

const ACCEPTED_TYPES = ['image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;

const fileProblem = (file) => {
  if (!file) return null;
  if (file.size > MAX_BYTES) return `“${file.name}” is larger than 5 MB.`;
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return `“${file.name}” is not an AVIF, GIF, JPEG, PNG or WebP image.`;
  }
  return null;
};

// One row per variant combination, each with its own main image and gallery.
// A colour helper uploads the same gallery to every combination that contains a
// keyword, so a colour only has to be given images once.
export default function VariantImagePanel({
  product,
  onUpload,
  onDeleteMain,
  onDeleteGallery,
  disabled = false,
}) {
  const combinations = product?.variantCombinations ?? [];

  const [picked, setPicked] = useState({});
  const [keyword, setKeyword] = useState('');
  const [bulkFiles, setBulkFiles] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  if (disabled || combinations.length === 0) {
    return (
      <section className="rounded-3xl border border-border bg-white p-5 sm:p-6">
        <h2 className="text-base font-medium text-primary">Variant images</h2>
        <p className="mt-1 text-xs leading-5 text-muted">
          {combinations.length === 0
            ? 'This product has no variant combinations yet. Add variants and combinations in the product form, save, then give each combination its images here.'
            : 'Save the product first. Combination images attach to a saved combination.'}
        </p>
      </section>
    );
  }

  const setFiles = (variantId, kind, files) => {
    setPicked((current) => ({ ...current, [variantId]: { ...current[variantId], [kind]: files } }));
  };

  const uploadOne = async (variantId) => {
    const pending = picked[variantId] ?? {};
    const mainImage = pending.mainImage?.[0] ?? null;
    const galleryImages = pending.galleryImages ?? [];

    if (!mainImage && galleryImages.length === 0) {
      setMessage({ tone: 'error', text: 'Choose a main image or gallery images first.' });
      return;
    }

    const problem = [mainImage, ...galleryImages].map(fileProblem).find(Boolean);
    if (problem) {
      setMessage({ tone: 'error', text: problem });
      return;
    }

    setBusyId(variantId);
    setMessage(null);
    try {
      await onUpload?.(variantId, { mainImage, galleryImages });
      setPicked((current) => ({ ...current, [variantId]: {} }));
      setMessage({ tone: 'success', text: 'Combination images saved.' });
    } catch (error) {
      setMessage({ tone: 'error', text: String(error) });
    } finally {
      setBusyId(null);
    }
  };

  const applyToColour = async () => {
    const word = keyword.trim().toLowerCase();
    if (!word) {
      setMessage({ tone: 'error', text: 'Type a colour (or any word in the combination name) first.' });
      return;
    }
    if (bulkFiles.length === 0) {
      setMessage({ tone: 'error', text: 'Choose one or more images to apply.' });
      return;
    }

    const problem = bulkFiles.map(fileProblem).find(Boolean);
    if (problem) {
      setMessage({ tone: 'error', text: problem });
      return;
    }

    const targets = combinations.filter((combination) =>
      String(combination.variantName ?? '').toLowerCase().includes(word),
    );
    if (targets.length === 0) {
      setMessage({ tone: 'error', text: `No combination contains “${keyword.trim()}”.` });
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      await Promise.all(
        targets.map((combination) =>
          onUpload?.(combination._id, { galleryImages: bulkFiles }),
        ),
      );
      setMessage({
        tone: 'success',
        text: `Applied ${bulkFiles.length} image${bulkFiles.length === 1 ? '' : 's'} to ${targets.length} combination${targets.length === 1 ? '' : 's'}.`,
      });
      setBulkFiles([]);
    } catch (error) {
      setMessage({ tone: 'error', text: String(error) });
    } finally {
      setBusy(false);
    }
  };

  const locked = busy;

  return (
    <section className="rounded-3xl border border-border bg-white p-5 sm:p-6">
      <h2 className="text-base font-medium text-primary">Variant images</h2>
      <p className="mt-1 text-xs leading-5 text-muted">
        One main image and up to 10 gallery images per combination. The gallery is
        what customers flip through after picking a variant.
      </p>

      <div className="mt-4 flex flex-col gap-4">
        {combinations.map((combination) => {
          const gallery = combination.galleryImages ?? [];

          return (
            <div key={combination._id} className="rounded-2xl border border-border bg-background p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-primary">{combination.variantName}</p>
                <p className="text-[11px] text-muted">
                  ₹{combination.price} · {combination.stock} in stock
                </p>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-[8rem_1fr]">
                <div className="rounded-xl border border-border bg-white p-2">
                  <p className="text-[11px] font-semibold text-primary">Main image</p>
                  <span className="relative mt-2 flex h-20 items-center justify-center overflow-hidden rounded-lg border border-border bg-white">
                    {combination.mainImage ? (
                      <img src={combination.mainImage} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <ImageOff size={18} strokeWidth={1.5} aria-hidden="true" className="text-muted" />
                    )}

                    {busyId === combination._id && <UploadSpinner size={16} />}
                  </span>
                  {combination.mainImage && (
                    <button
                      type="button"
                      disabled={locked}
                      onClick={() => onDeleteMain?.(combination._id)}
                      className="mt-1 text-[11px] font-semibold text-red-700 disabled:opacity-45"
                    >
                      Remove
                    </button>
                  )}
                  <input
                    type="file"
                    accept={ACCEPTED_TYPES.join(',')}
                    disabled={locked}
                    onChange={(event) => setFiles(combination._id, 'mainImage', event.target.files)}
                    className="mt-1 w-full text-[10px] text-muted file:mr-1 file:min-h-7 file:rounded-full file:border file:border-border file:bg-white file:px-2 file:text-[10px] file:text-primary"
                  />
                </div>

                <div className="rounded-xl border border-border bg-white p-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] font-semibold text-primary">
                      Gallery ({gallery.length}/10)
                    </p>
                  </div>

                  <div className="relative mt-2 min-h-14 rounded-lg">
                    {gallery.length > 0 && (
                      <ul className="flex flex-wrap gap-2">
                        {gallery.map((url, index) => (
                          <li key={`${url}-${index}`} className="relative">
                            <span className="flex size-14 items-center justify-center overflow-hidden rounded-lg border border-border">
                              <img src={url} alt="" className="h-full w-full object-cover" />
                            </span>
                            <button
                              type="button"
                              disabled={locked}
                              onClick={() => onDeleteGallery?.(combination._id, index)}
                              aria-label={`Remove gallery image ${index + 1}`}
                              className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full border border-red-200 bg-white text-[10px] text-red-700 disabled:opacity-45"
                            >
                              ×
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}

                    {(busyId === combination._id || busy) && (
                      <UploadSpinner size={18} label="Saving images" />
                    )}
                  </div>

                  <input
                    type="file"
                    multiple
                    accept={ACCEPTED_TYPES.join(',')}
                    disabled={locked}
                    onChange={(event) => setFiles(combination._id, 'galleryImages', event.target.files)}
                    className="mt-2 w-full text-[10px] text-muted file:mr-1 file:min-h-7 file:rounded-full file:border file:border-border file:bg-white file:px-2 file:text-[10px] file:text-primary"
                  />

                  <div className="mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      loading={busyId === combination._id}
                      disabled={locked}
                      onClick={() => uploadOne(combination._id)}
                    >
                      <Upload size={14} strokeWidth={1.9} aria-hidden="true" />
                      Save images
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 rounded-2xl border border-dashed border-peach bg-peach/20 p-4">
        <p className="flex items-center gap-2 text-sm font-medium text-primary">
          <Layers size={16} strokeWidth={1.8} aria-hidden="true" />
          Apply images to a whole colour
        </p>
        <p className="mt-1 text-xs leading-5 text-muted">
          Type a colour that appears in the combination names (for example “Red”)
          and choose images. They are added to every combination that contains it.
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Red"
            aria-label="Colour or word to match"
            className="min-h-10 rounded-xl border border-border bg-white px-3 text-sm text-primary outline-none focus:border-accent"
          />

          <input
            type="file"
            multiple
            accept={ACCEPTED_TYPES.join(',')}
            disabled={locked}
            onChange={(event) => setBulkFiles(Array.from(event.target.files ?? []))}
            className="text-[11px] text-muted file:mr-2 file:min-h-8 file:rounded-full file:border file:border-border file:bg-white file:px-3 file:text-[11px] file:text-primary"
          />

          <Button type="button" variant="primary" loading={busy} disabled={locked} onClick={applyToColour}>
            Apply
          </Button>
        </div>
      </div>

      {message && (
        <p
          role={message.tone === 'error' ? 'alert' : 'status'}
          className={[
            'mt-4 rounded-2xl border px-4 py-3 text-xs',
            message.tone === 'error'
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-peach bg-peach/30 text-primary',
          ].join(' ')}
        >
          {message.text}
        </p>
      )}
    </section>
  );
}
