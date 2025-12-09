import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Video, VideoAnalytics } from '../types';
import { apiUrl } from '../utils/api';

interface VideoContextType {
  videos: Video[];
  addVideo: (video: Video) => void;
  incrementView: (id: string, device: 'desktop' | 'tablet' | 'mobile') => void;
  getVideoById: (id: string) => Video | undefined;
  updateVideo: (video: Video) => void;
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
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    const loadFromApi = async () => {
      try {
        const res = await fetch(apiUrl('/api/videos'));
        if (!res.ok) return;
        const data: Video[] = await res.json();
        if (Array.isArray(data)) {
          setVideos(data);
        }
      } catch (err) {
        console.error('Failed to load videos from API', err);
      }
    };

    loadFromApi();
  }, []);

  const addVideo = useCallback((video: Video) => {
    setVideos(prev => [video, ...prev]);
  }, []);

  const updateVideo = useCallback((video: Video) => {
    setVideos(prev => prev.map(v => (v._id === video._id ? video : v)));
  }, []);

  const incrementView = useCallback((id: string, device: 'desktop' | 'tablet' | 'mobile') => {
    // Optimistic update
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

    // Persist to backend
    fetch(apiUrl(`/api/videos/${id}/view`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ device })
    })
      .then(async (res) => {
        if (!res.ok) return;
        const updated: Video = await res.json();
        setVideos(prev =>
          prev.map(v => (v._id === updated._id ? updated : v))
        );
      })
      .catch(err => {
        console.error('Failed to increment view on backend', err);
      });
  }, []);

  const getVideoById = useCallback((id: string) => {
    return videos.find(v => v._id === id);
  }, [videos]);

  return (
    <VideoContext.Provider value={{ videos, addVideo, incrementView, getVideoById, updateVideo }}>
      {children}
    </VideoContext.Provider>
  );
};