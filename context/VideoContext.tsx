import React, { createContext, useContext, useState, useCallback } from 'react';
import { Video, VideoAnalytics } from '../types';
import { MOCK_VIDEOS_INITIAL } from '../constants';

interface VideoContextType {
  videos: Video[];
  addVideo: (video: Video) => void;
  incrementView: (id: string, device: 'desktop' | 'tablet' | 'mobile') => void;
  getVideoById: (id: string) => Video | undefined;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export const useVideos = () => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error('useVideos must be used within a VideoProvider');
  }
  return context;
};

export const VideoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [videos, setVideos] = useState<Video[]>(MOCK_VIDEOS_INITIAL);

  const addVideo = useCallback((video: Video) => {
    setVideos(prev => [video, ...prev]);
  }, []);

  const incrementView = useCallback((id: string, device: 'desktop' | 'tablet' | 'mobile') => {
    setVideos(prev => prev.map(v => {
      if (v._id === id) {
        return {
          ...v,
          analytics: {
            ...v.analytics,
            views: v.analytics.views + 1,
            devices: {
              ...v.analytics.devices,
              [device]: v.analytics.devices[device] + 1
            }
          }
        };
      }
      return v;
    }));
  }, []);

  const getVideoById = useCallback((id: string) => {
    return videos.find(v => v._id === id);
  }, [videos]);

  return (
    <VideoContext.Provider value={{ videos, addVideo, incrementView, getVideoById }}>
      {children}
    </VideoContext.Provider>
  );
};