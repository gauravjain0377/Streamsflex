import { DeviceType } from '../types';
import { BREAKPOINTS } from '../constants';

export const getDeviceType = (): DeviceType => {
  const width = window.innerWidth;
  if (width < BREAKPOINTS.MOBILE) return DeviceType.MOBILE;
  if (width < BREAKPOINTS.TABLET) return DeviceType.TABLET;
  return DeviceType.DESKTOP;
};

export const getAspectRatioClass = (device: DeviceType): string => {
  switch (device) {
    case DeviceType.MOBILE:
      return 'aspect-[9/16]';
    case DeviceType.TABLET:
      return 'aspect-[4/3]';
    case DeviceType.DESKTOP:
    default:
      return 'aspect-video'; // 16/9
  }
};

export const getTransformedUrl = (originalUrl: string, device: DeviceType): string => {
  // IMPORTANT:
  // We intentionally return the *original* URL without extra `tr=` transformations.
  // Reason: ImageKit charges "video processing units" for on-the-fly transformed video.
  // When those units are exhausted, transformed URLs can fail (especially on mobile/tablet),
  // causing the video not to load. Serving the original URL keeps playback reliable.
  // If you later upgrade your ImageKit plan and want device-specific crops again,
  // we can re-enable the transformation logic here.
  return originalUrl;
};