import MenuFeatured from "./menuFeatured.model.js";
import { menuRepository } from "./menu.repository.js";

// The menu is read on every page of the storefront, so it gets its own small
// cache rather than a database round trip per navigation. Five minutes is short
// enough that a newly published product shows up while an admin is still in the
// panel, and long enough that the aggregation runs a handful of times an hour.
const CACHE_TTL = 5 * 60 * 1000;

let cache = { collections: null, storedAt: 0 };

const isFresh = () => cache.collections !== null && Date.now() - cache.storedAt < CACHE_TTL;

export const menuService = {
  getCollections: async ({ limit = 6 } = {}) => {
    if (isFresh()) return cache.collections;

    const collections = await menuRepository.getCollections({ limit });

    cache = { collections, storedAt: Date.now() };

    return collections;
  },

  // An admin editing the featured card should see the change straight away, so
  // the cached menu is dropped with it.
  clearCache: () => {
    cache = { collections: null, storedAt: 0 };
  },

  // One document, created with the panel's defaults the first time it is read.
  getFeatured: async () => {
    const existing = await MenuFeatured.findOne({ key: "collections" });

    if (existing) return existing;

    return MenuFeatured.create({ key: "collections" });
  },

  updateFeatured: async (changes) => {
    const featured = await MenuFeatured.findOneAndUpdate(
      { key: "collections" },
      { $set: changes },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );

    menuService.clearCache();

    return featured;
  },
};

export default menuService;
