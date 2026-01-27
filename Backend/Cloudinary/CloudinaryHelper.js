import cloudinary from "./Cloudinary.js";
import streamifier from "streamifier";

// ================= UPLOAD =================
export const uploadToCloudinary = (fileBuffer, folderName) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: folderName },
      (error, result) => {
        if (result) {
          resolve({
            success: true,
            url: result.secure_url,
            public_id: result.public_id,
          });
        } else {
          reject({ success: false, error });
        }
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};


// ================= DELETE =================
export const deleteFromCloudinary = async (publicId) => {
  const result = await cloudinary.uploader.destroy(publicId);
  return result;
};


// ================= UPDATE =================
export const updateCloudinaryImage = async (oldPublicId, fileBuffer, folderName) => {
  if (oldPublicId) {
    await deleteFromCloudinary(oldPublicId);
  }

  const uploadResult = await uploadToCloudinary(fileBuffer, folderName);
  return uploadResult;
};
