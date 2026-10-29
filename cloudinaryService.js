require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const path = require("path");

/**
 * Configure Cloudinary from environment variables
 * Supports:
 *  1. Unified connection string: CLOUDINARY_URL (e.g. cloudinary://API_KEY:API_SECRET@CLOUD_NAME)
 *  2. Individual credentials: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 */
function configureCloudinary() {
  const cloudinaryUrl = (process.env.CLOUDINARY_URL || "").trim();
  if (cloudinaryUrl && cloudinaryUrl.startsWith("cloudinary://")) {
    const match = cloudinaryUrl.match(/^cloudinary:\/\/([^:]+):([^@]+)@([^/?#]+)/i);
    if (match) {
      const apiKey = match[1].trim();
      const apiSecret = match[2].trim();
      const cloudName = match[3].trim();
      if (
        !isPlaceholder(apiKey) &&
        !isPlaceholder(apiSecret) &&
        !isPlaceholder(cloudName)
      ) {
        cloudinary.config({
          cloud_name: cloudName,
          api_key: apiKey,
          api_secret: apiSecret,
          secure: true
        });
        return;
      }
    }
  }

  const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME || "").trim();
  const apiKey = (process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_KEY || "").trim();
  const apiSecret = (process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_SECRET || "").trim();

  if (
    cloudName &&
    apiKey &&
    apiSecret &&
    !isPlaceholder(cloudName) &&
    !isPlaceholder(apiKey) &&
    !isPlaceholder(apiSecret)
  ) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true
    });
  }
}

/**
 * Helper to ignore common template placeholder strings
 */
function isPlaceholder(val) {
  if (!val) return true;
  const lower = String(val).toLowerCase().trim();
  return (
    lower.includes("your_") ||
    lower.includes("example") ||
    lower === "api_key" ||
    lower === "api_secret" ||
    lower === "cloud_name" ||
    lower === "your-cloud-name"
  );
}

// Initial configuration attempt
configureCloudinary();

/**
 * Check if Cloudinary credentials are fully and properly configured
 * @returns {boolean}
 */
function isCloudinaryConfigured() {
  configureCloudinary();
  const config = cloudinary.config();
  const cloudName = String(config.cloud_name || "").trim();
  const apiKey = String(config.api_key || "").trim();
  const apiSecret = String(config.api_secret || "").trim();

  return Boolean(
    cloudName.length > 0 &&
    apiKey.length > 0 &&
    apiSecret.length > 0 &&
    !isPlaceholder(cloudName) &&
    !isPlaceholder(apiKey) &&
    !isPlaceholder(apiSecret)
  );
}

/**
 * Upload a PDF file buffer directly to Cloudinary via upload_stream
 * Eliminates local disk writes and prevents EROFS errors on Vercel
 *
 * @param {Buffer} fileBuffer - The in-memory file buffer from multer.memoryStorage()
 * @param {string} originalName - Original filename submitted by student
 * @returns {Promise<{secure_url: string, public_id: string, bytes: number, format: string, original_filename: string}>}
 */
function uploadPdfToCloudinary(fileBuffer, originalName) {
  return new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured()) {
      return reject(
        new Error(
          "Cloudinary credentials missing or invalid. Please configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET (or CLOUDINARY_URL) in environment variables."
        )
      );
    }

    if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
      return reject(new Error("Invalid file buffer provided for cloud upload."));
    }

    // Clean and sanitize filename for cloud storage public_id
    const parsed = path.parse(originalName || "contribution.pdf");
    const cleanBase = (parsed.name || "contribution")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .substring(0, 50);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e4);
    const publicId = `${uniqueSuffix}-${cleanBase}`;

    const uploadOptions = {
      folder: "student_study_portal/contributions",
      public_id: publicId,
      resource_type: "auto",
      format: "pdf",
      access_mode: "public",
      overwrite: false
    };

    let settled = false;
    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        reject(new Error("Cloudinary upload timed out after 45 seconds. Please check your internet connection or cloud storage account."));
      }
    }, 45000);

    const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);

      if (error) {
        console.error("Cloudinary uploader encountered error:", error);
        return reject(error);
      }
      if (!result || !result.secure_url) {
        return reject(new Error("Cloudinary upload did not return a valid secure URL."));
      }
      resolve({
        secure_url: result.secure_url,
        public_id: result.public_id,
        bytes: result.bytes || fileBuffer.length,
        format: result.format || "pdf",
        original_filename: originalName || `${cleanBase}.pdf`
      });
    });

    stream.on("error", (streamErr) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      console.error("Cloudinary stream error:", streamErr);
      reject(streamErr);
    });

    stream.end(fileBuffer);
  });
}

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  uploadPdfToCloudinary
};
