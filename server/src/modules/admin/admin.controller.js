import * as adminService from "./admin.service.js";

export const getDashboard = async (req, res, next) => {
  try {
    return res.json({
      success: true,
      message: "Dashboard fetched",
      data: await adminService.getDashboard(),
    });
  } catch (error) {
    return next(error);
  }
};
export const listUsers = async (req, res, next) => {
  try {
    return res.json({
      success: true,
      message: "Users fetched",
      data: await adminService.listUsers(),
    });
  } catch (error) {
    return next(error);
  }
};
export const setUserStatus = async (req, res, next) => {
  try {
    const user = await adminService.setUserStatus(req.params.userId, req.body.status, req.user.id);
    return res.json({ success: true, message: "User status updated", data: user });
  } catch (error) {
    return next(error);
  }
};
