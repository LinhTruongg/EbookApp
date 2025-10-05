// Cloudinary Service for managing PDF and image URLs
export class CloudinaryService {
  private static readonly CLOUD_NAME = 'c-d4c0306400a342b7046a193a56a625';
  private static readonly BASE_URL = `https://res.cloudinary.com/${CloudinaryService.CLOUD_NAME}`;

  /**
   * Generate optimized PDF URL for viewing
   */
  static getPDFUrl(publicId: string, options: {
    format?: string;
  } = {}): string {
    const { format = 'pdf' } = options;
    
    // For PDFs, use raw/upload instead of image/upload
    return `${CloudinaryService.BASE_URL}/raw/upload/${publicId}.${format}`;
  }

  /**
   * Generate optimized image URL for book covers
   */
  static getImageUrl(publicId: string, options: {
    width?: number;
    height?: number;
    format?: string;
    quality?: string;
    crop?: string;
  } = {}): string {
    const { 
      width = 300, 
      height = 400, 
      format = 'jpg', 
      quality = 'auto',
      crop = 'fill'
    } = options;
    
    const transformation = `w_${width},h_${height},c_${crop},f_auto,q_${quality}`;
    
    return `${CloudinaryService.BASE_URL}/image/upload/${transformation}/${publicId}.${format}`;
  }

  /**
   * Generate thumbnail URL for quick previews
   */
  static getThumbnailUrl(publicId: string, size: number = 150): string {
    return CloudinaryService.getImageUrl(publicId, {
      width: size,
      height: size,
      crop: 'thumb'
    });
  }

  /**
   * Get PDF URL with viewer parameters for iframe
   */
  static getPDFViewerUrl(publicId: string): string {
    const baseUrl = CloudinaryService.getPDFUrl(publicId);
    return `${baseUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`;
  }

  /**
   * Extract public ID from Cloudinary URL
   */
  static extractPublicId(url: string): string | null {
    const match = url.match(/\/upload\/[^\/]+\/([^\.]+)/);
    return match ? match[1] : null;
  }
}

// Example usage:
// const pdfUrl = CloudinaryService.getPDFViewerUrl('6bbcb22f65eac1f89ac857121e5d4abd');
// const coverUrl = CloudinaryService.getImageUrl('book-cover-id', { width: 300, height: 400 });
// const thumbnailUrl = CloudinaryService.getThumbnailUrl('book-cover-id', 100);
