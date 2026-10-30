import { menuService } from "./menu.service.js";

// GET /api/menu/collections
// The mega menu's data: every live department with its product count and its
// newest products, in the order the panel shows them.
export const listMenuCollections = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit ?? 6);
    const data = await menuService.getCollections({ limit: Math.min(Math.max(limit, 1), 12) });

    res.status(200).json({ success: true, message: "Menu collections fetched", data });
  } catch (error) {
    next(error);
  }
};

// GET /api/menu/featured
// The editable card on the right of the menu.
export const getMenuFeatured = async (req, res, next) => {
  try {
    const data = await menuService.getFeatured();

    res.status(200).json({ success: true, message: "Menu featured card fetched", data });
  } catch (error) {
    next(error);
  }
};

// PUT /api/menu/featured (admin)
// Change the card's eyebrow, title, button text and link without a deployment.
export const updateMenuFeatured = async (req, res, next) => {
  try {
    const data = await menuService.updateFeatured(req.body);

    res.status(200).json({ success: true, message: "Menu featured card updated", data });
  } catch (error) {
    next(error);
  }
};
