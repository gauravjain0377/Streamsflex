export enum DeviceType {
  DESKTOP = 'desktop',
  TABLET = 'tablet',
  MOBILE = 'mobile',
}

export interface VideoAnalytics {
  views: number;
  devices: {
    desktop: number;
    tablet: number;
    mobile: number;
  };
  watchTime: number; // in seconds
}

export interface Video {
  _id: string;
  title: string;
  description: string;
  originalUrl: string;
  thumbnailUrl: string; // Base thumbnail
  uploadedBy: string;
  createdAt: string;
  duration: number; // in seconds
  size: number; // in bytes
  likes: number;
  analytics: VideoAnalytics;

  // Optional Cloudinary identifiers for safe deletion
  cloudinaryPublicId?: string;
  cloudinaryThumbnailPublicId?: string;
}

export interface ChartData {
  name: string;
  value: number;
}