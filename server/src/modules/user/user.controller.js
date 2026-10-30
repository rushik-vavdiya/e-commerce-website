import { UserRepository } from "./user.repository.js";
import { deleteUser as removeUser, updateMe as updateCurrentUser } from "./user.service.js";
import {
  deleteProfilePicture as removeProfilePicture,
  updateProfilePicture as saveProfilePicture,
} from "./user.service.js";

const currentUserId = (req) => req.user?.id ?? req.user?._id;

export const getme = async (req, res, next) => {
  try {
    const userId = currentUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await UserRepository.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    const user = await updateCurrentUser(currentUserId(req), req.body);
    return res.status(200).json({ success: true, message: "User profile updated", data: user });
  } catch (error) {
    return next(error);
  }
};

export const getProfilePicture = async (req, res, next) => {
  try {
    const userId = currentUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await UserRepository.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile picture fetched successfully",
      data: { profilePicture: user.profilePicture ?? null },
    });
  } catch (error) {
    return next(error);
  }
};

export const updateProfilePicture = async (req, res, next) => {
  try {
    const userId = currentUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await saveProfilePicture(userId, req.file);

    return res.status(200).json({
      success: true,
      message: "Profile picture updated successfully",
      data: { profilePicture: user.profilePicture },
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteProfilePicture = async (req, res, next) => {
  try {
    const userId = currentUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    await removeProfilePicture(userId);

    return res.status(200).json({
      success: true,
      message: "Profile picture deleted successfully",
      data: { profilePicture: null },
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const userId = currentUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await removeUser(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

export const changeUserStatus = async (req, res, next) => {
  try {
    // userStatusSchema has already limited `status` to active or inactive.
    const user = await UserRepository.changeUserStatus(req.params.userId, req.body.status);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User status updated successfully",
      data: user,
    });
  } catch (error) {
    return next(error);
  }
};
