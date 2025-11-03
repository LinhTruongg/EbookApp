const cloudinary = require('cloudinary').v2;

class CloudinaryUtils {
  static CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'c-d4c0306400a342b7046a193a56a625';
  static API_KEY = process.env.CLOUDINARY_API_KEY;
  static API_SECRET = process.env.CLOUDINARY_API_SECRET;
  static BASE_URL = `https://res.cloudinary.com/${CloudinaryUtils.CLOUD_NAME}`;

  static {
    // Configure Cloudinary with credentials
    cloudinary.config({
      cloud_name: CloudinaryUtils.CLOUD_NAME,
      api_key: CloudinaryUtils.API_KEY,
      api_secret: CloudinaryUtils.API_SECRET,
    });
  }

  /**
   * Generate a signed download URL for a specific asset
   * @param {string} publicId - Cloudinary public_id
   * @param {object} options - URL generation options
   * @returns {string} Signed download URL
   */
  static generateSignedDownloadUrl(publicId, options = {}) {
    if (!publicId) {
      return null;
    }

    const {
      resource_type = 'raw',
      format = 'pdf',
      expiration = 3600, // 1 hour default
      ...otherOptions
    } = options;

    const url = cloudinary.url(publicId, {
      sign_url: true,
      resource_type,
      format,
      expires_at: Math.round(Date.now() / 1000) + expiration,
      ...otherOptions
    });

    console.log(url);

    return url;
  }

  /**
   * Generate downloadable PDF URL from Cloudinary asset ID
   * @param {string} assetId - Cloudinary public_id
   * @param {object} options - URL generation options
   * @returns {string} Downloadable PDF URL
   */
  static getDownloadablePDFUrl(assetId, options = {}) {
    if (!assetId) {
      return null;
    }

    const {
      format = 'pdf',
      signed = true,
      expiration = 3600
    } = options;

    if (signed) {
      return CloudinaryUtils.generateSignedDownloadUrl(assetId, {
        resource_type: 'raw',
        format,
        expiration
      });
    }

    // For unsigned URLs, use the direct URL
    return `${CloudinaryUtils.BASE_URL}/raw/upload/${assetId}.${format}`;
  }

  /**
   * Generate PDF viewer URL for iframe display
   * @param {string} assetId - Cloudinary public_id
   * @param {object} options - URL generation options
   * @returns {string} PDF viewer URL
   */
  static getPDFViewerUrl(assetId, options = {}) {
    if (!assetId) {
      return null;
    }

    const {
      format = 'pdf',
      signed = false // Viewer URLs typically don't need signing
    } = options;

    // For PDF viewer, use raw/upload with viewer parameters
    let url = `${CloudinaryUtils.BASE_URL}/raw/upload/${assetId}.${format}`;
    
    // Add viewer parameters for iframe
    url += '#toolbar=1&navpanes=1&scrollbar=1&view=FitH';
    
    return url;
  }

  /**
   * Generate optimized image URL for book covers
   * @param {string} assetId - Cloudinary public_id
   * @param {object} options - URL generation options
   * @returns {string} Optimized image URL
   */
  static getImageUrl(assetId, options = {}) {
    if (!assetId) {
      return null;
    }

    const {
      width = 300,
      height = 400,
      format = 'jpg',
      quality = 'auto',
      crop = 'fill',
      signed = false,
      expiration = 3600
    } = options;

    const transformationOptions = {
      width,
      height,
      crop,
      quality,
      format
    };

    if (signed) {
      return cloudinary.url(assetId, {
        sign_url: true,
        resource_type: 'image',
        expires_at: Math.round(Date.now() / 1000) + expiration,
        ...transformationOptions
      });
    }

    // For unsigned URLs, use the direct URL with transformations
    const transformation = `w_${width},h_${height},c_${crop},f_auto,q_${quality}`;
    return `${CloudinaryUtils.BASE_URL}/image/upload/${transformation}/${assetId}.${format}`;
  }

  /**
   * Generate thumbnail URL for quick previews
   * @param {string} assetId - Cloudinary public_id
   * @param {number} size - Thumbnail size
   * @returns {string} Thumbnail URL
   */
  static getThumbnailUrl(assetId, size = 150) {
    if (!assetId) {
      return null;
    }

    return CloudinaryUtils.getImageUrl(assetId, {
      width: size,
      height: size,
      crop: 'thumb'
    });
  }

  /**
   * Upload Base64 image to Cloudinary
   * @param {string} base64Data - Base64 image data
   * @param {string} publicId - Public ID for the image
   * @param {object} options - Upload options
   * @returns {Promise<object>} Upload result
   */
  static async uploadBase64Image(base64Data, publicId, options = {}) {
    try {
      const {
        folder = 'uploads',
        resource_type = 'image',
        format = 'jpg',
        quality = 'auto',
        transformation = []
      } = options;

      const uploadOptions = {
        public_id: publicId,
        folder,
        resource_type,
        format,
        quality,
        transformation
      };

      const result = await cloudinary.uploader.upload(
        `data:image/jpeg;base64,${base64Data}`,
        uploadOptions
      );

      console.log('✅ [CloudinaryUtils] Image uploaded successfully:', {
        publicId: result.public_id,
        url: result.secure_url,
        size: result.bytes
      });

      return result;
    } catch (error) {
      console.error('❌ [CloudinaryUtils] Error uploading image:', error);
      throw error;
    }
  }

  /**
   * Extract public ID from Cloudinary URL
   * @param {string} url - Cloudinary URL
   * @returns {string|null} Public ID or null if not found
   */
  static extractPublicId(url) {
    if (!url) return null;
    
    const match = url.match(/\/upload\/[^\/]+\/([^\.]+)/);
    return match ? match[1] : null;
  }
}

module.exports = CloudinaryUtils;
