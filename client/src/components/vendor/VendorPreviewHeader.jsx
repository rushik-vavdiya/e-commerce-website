import { Link } from 'react-router-dom';
import { Eye, LogIn } from 'lucide-react';

// Header for /vendor-preview. It never renders the signed-in user's data and
// never signs anyone out — it is a read-only UI inspection shell.
export default function VendorPreviewHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex w-full max-w-[1900px] items-center justify-between gap-3 px-5 py-3 sm:px-8 lg:px-10">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-peach bg-peach/40 text-primary">
            <Eye size={17} strokeWidth={1.8} aria-hidden="true" />
          </span>

          <span className="flex min-w-0 flex-col">
            <span className="text-lg font-medium leading-none tracking-[-0.05em] text-primary">
              VENDOR UI PREVIEW
            </span>
            <span className="mt-1 truncate text-[7px] tracking-[0.25em] text-accent">
              DEMO DATA · READ ONLY
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/vendor"
            className="hidden min-h-9 items-center rounded-full border border-border bg-white px-4 text-xs font-medium text-primary transition-colors hover:border-accent hover:text-accent sm:inline-flex"
          >
            Real vendor dashboard
          </Link>

          <Link
            to="/login"
            className="inline-flex min-h-9 items-center gap-2 rounded-full bg-primary px-4 text-xs font-medium text-white transition-colors hover:bg-accent"
          >
            <LogIn size={14} strokeWidth={1.9} aria-hidden="true" />
            Sign in
          </Link>
        </div>
      </div>
    </header>
  );
}
