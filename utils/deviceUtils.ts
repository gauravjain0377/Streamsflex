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
  // In a real app, this interacts with ImageKit
  // Example: https://ik.imagekit.io/id/video.mp4?tr=ar-16-9
  
  let transformation = '';
  switch (device) {
    case DeviceType.MOBILE:
      transformation = 'tr=ar-9-16';
      break;
    case DeviceType.TABLET:
      transformation = 'tr=ar-4-3';
      break;
    case DeviceType.DESKTOP:
    default:
      transformation = 'tr=ar-16-9';
      break;
  }

  // Check if URL already has query params
  const separator = originalUrl.includes('?') ? '&' : '?';
  return `${originalUrl}${separator}${transformation}`;
};