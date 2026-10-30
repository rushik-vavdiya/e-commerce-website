import { Link, useLocation } from "react-router-dom";

import MegaMenu from "../MegaMenu/MegaMenu";

// Desktop navigation row. The links come from the header, which builds them
// once from siteContent plus the live categories, so the desktop bar and the
// mobile menu always show the same thing.
//
// One entry is special: the Collections link opens the department mega menu on
// hover (or a click) instead of jumping straight to the shop page. It is picked
// out by label, so the ordering still comes from siteContent.json. The menu
// itself (components/MegaMenu/MegaMenu.jsx) reads its own data.
const NAV_ARIA_LABEL = "Main navigation";

export default function Navbar({ links = [], collectionsLabel = "", className = "" }) {
  const location = useLocation();

  return (
    <nav aria-label={NAV_ARIA_LABEL} className={`flex items-center gap-4 xl:gap-5 2xl:gap-6 ${className}`}>
      {links.map((link, index) => {
        if (collectionsLabel && link.label === collectionsLabel) {
          return (
            <MegaMenu key={`${link.href}-${index}`} label={link.label} />
          );
        }

        const isActive = location.pathname === link.href;

        return (
          <Link
            key={`${link.href}-${index}`}
            to={link.href}
            className={`relative inline-flex items-center whitespace-nowrap py-2 text-sm font-medium transition-colors duration-200 ${
              isActive ? "text-accent" : "text-primary hover:text-accent"
            }`}
          >
            {link.label}

            {isActive && (
              <span className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-accent" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
