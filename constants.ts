export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
};

// Using a sample video for demo purposes since we don't have a real backend upload
export const SAMPLE_VIDEO_URL = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
export const SAMPLE_THUMBNAIL = "https://picsum.photos/800/450";

export const MOCK_VIDEOS_INITIAL = [
  {
    _id: "1",
    title: "Mountain Expedition 4K",
    description: "A breathtaking journey through the high peaks of the Alps.",
    originalUrl: SAMPLE_VIDEO_URL,
    thumbnailUrl: "https://picsum.photos/id/1018/800/450",
    uploadedBy: "Admin",
    createdAt: new Date().toISOString(),
    duration: 596,
    size: 45000000,
    analytics: {
      views: 1205,
      devices: { desktop: 800, tablet: 200, mobile: 205 },
      watchTime: 450000
    }
  },
  {
    _id: "2",
    title: "Urban Architecture",
    description: "Exploring modern design in Tokyo.",
    originalUrl: SAMPLE_VIDEO_URL,
    thumbnailUrl: "https://picsum.photos/id/1015/800/450",
    uploadedBy: "CreatorPro",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    duration: 320,
    size: 25000000,
    analytics: {
      views: 850,
      devices: { desktop: 300, tablet: 150, mobile: 400 },
      watchTime: 210000
    }
  },
  {
    _id: "3",
    title: "Ocean Life Documentary",
    description: "Deep dive into the coral reefs.",
    originalUrl: SAMPLE_VIDEO_URL,
    thumbnailUrl: "https://picsum.photos/id/1019/800/450",
    uploadedBy: "NatureDoc",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    duration: 1200,
    size: 105000000,
    analytics: {
      views: 3200,
      devices: { desktop: 1500, tablet: 800, mobile: 900 },
      watchTime: 1200000
    }
  }
];