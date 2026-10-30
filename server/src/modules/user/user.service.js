import { UserRepository } from "./user.repository.js";
import { deleteImage } from "../../services/cloudinary.service.js";
import { AppError } from "../../utils/AppError.js";
import { uploadToCloudinary } from "../../utils/cloudinary.js";

// Optional profile values: a null (or omitted) value clears the stored value.
// Storing null instead would fail the gender enum, and a null birth date would
// otherwise be coerced to a real date, so these are unset on the document.
const OPTIONAL_PROFILE_FIELDS = ["gender", "birthDate"];

export const updateMe = async (userId, data) => {
  const allowedFields = ["firstName", "lastName", "gender", "birthDate", "phone"];
  const provided = Object.fromEntries(
    Object.entries(data).filter(([key]) => allowedFields.includes(key)),
  );

  const values = Object.fromEntries(
    Object.entries(provided).filter(([, value]) => value !== null && value !== undefined),
  );
  const cleared = OPTIONAL_PROFILE_FIELDS.filter(
    (field) => field in provided && provided[field] == null,
  );

  const updatedUser = await UserRepository.updateUser(userId, values, cleared);
  if (!updatedUser) throw new AppError("User not found", 404);
  return updatedUser;
};

export const deleteUser = async (userId) => {
  const user = await UserRepository.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const deletedUser = await UserRepository.deleteUser(userId);
  if (user.profilePicturePublicId) {
    try {
      await deleteImage(user.profilePicturePublicId);
    } catch (error) {
      console.error("Could not delete profile picture from Cloudinary", error);
    }
  }
  return deletedUser;
};

export const updateProfilePicture = async (userId, file) => {
  const user = await UserRepository.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const uploadedImage = await uploadToCloudinary(file, {
    folder: "users/profile-pictures",
  });

  let updatedUser;
  try {
    updatedUser = await UserRepository.updateProfilePicture(
      userId,
      uploadedImage.url,
      uploadedImage.publicId,
    );
  } catch (error) {
    try {
      await deleteImage(uploadedImage.publicId);
    } catch (cleanupError) {
      throw new AggregateError(
        [error, cleanupError],
        "Failed to save profile picture and clean up the uploaded image",
      );
    }
    throw error;
  }

  if (!updatedUser) {
    await deleteImage(uploadedImage.publicId);
    throw new AppError("User not found", 404);
  }

  if (user.profilePicturePublicId) {
    try {
      await deleteImage(user.profilePicturePublicId);
    } catch (error) {
      console.error("Could not delete replaced profile picture from Cloudinary", error);
    }
  }

  return updatedUser;
};

export const deleteProfilePicture = async (userId) => {
  const user = await UserRepository.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.profilePicture) {
    throw new AppError("User does not have a profile picture", 404);
  }

  const updatedUser = await UserRepository.updateProfilePicture(userId, null, null);

  if (!updatedUser) {
    throw new AppError("User not found", 404);
  }

  if (user.profilePicturePublicId) {
    try {
      await deleteImage(user.profilePicturePublicId);
    } catch (error) {
      console.error("Could not delete profile picture from Cloudinary", error);
    }
  }

  return updatedUser;
};
