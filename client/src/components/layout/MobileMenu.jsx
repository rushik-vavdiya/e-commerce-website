import { Link } from "react-router-dom";

import MobileCollections from "../MegaMenu/MobileCollections";
import { getContent, listContent } from "../../data/content";

// Links and labels come from src/data/siteContent.json. The header passes the
// live department links in; these are the fallback.
const defaultLinks = listContent("nav.links");
const signInLabel = getContent("nav.signInLabel");
const NAV_ARIA_LABEL = getContent("nav.mobileNavLabel");

// The Collections entry becomes an accordion fed by the same menu data as the
// desktop panel; every other entry stays a plain link.
export default function MobileMenu({
  open,
  onClose,
  links = defaultLinks,
  collectionsLabel = "Collections",
}) {
  if (!open) return null;

  return (
    <div className="border-t border-border bg-background lg:hidden">
      <nav
        aria-label={NAV_ARIA_LABEL}
        className="mx-auto flex max-w-[1900px] flex-col px-5 py-3"
      >
        {links.map((link, index) => {
          if (collectionsLabel && link.label === collectionsLabel) {
            return (
              <MobileCollections
                key={`${link.href}-${index}`}
                label={link.label}
                onNavigate={onClose}
              />
            );
          }

          return (
          <Link
            key={`${link.href}-${index}`}
            to={link.href}
            onClick={onClose}
            className="border-b border-border py-4 text-sm font-medium text-primary transition-colors duration-200 hover:text-accent"
          >
            {link.label}
          </Link>
          );
        })}

        <Link
          to="/login"
          onClick={onClose}
          className="mt-5 rounded-full bg-primary px-4 py-3 text-center text-sm font-semibold text-background transition-colors duration-200 hover:bg-accent"
        >
          {signInLabel}
        </Link>
      </nav>
    </div>
  );
}
