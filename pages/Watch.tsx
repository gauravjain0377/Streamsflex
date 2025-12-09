import React, { useEffect, useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVideos } from '../context/VideoContext';
import { useDevice } from '../context/DeviceContext';
import { VideoPlayer } from '../components/VideoPlayer';
import { Share2, ThumbsUp, Eye, Clock } from 'lucide-react';

export const Watch: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getVideoById, incrementView, updateVideo } = useVideos();
  const { deviceType } = useDevice();
  
  const video = getVideoById(id || '');
  const [displayDuration, setDisplayDuration] = useState<number | null>(video?.duration ?? null);

  useEffect(() => {
    if (id) {
      incrementView(id, deviceType);
    }
  }, [id, deviceType, incrementView]);

  const handleDurationKnown = useCallback(
    (durationSeconds: number) => {
      if (!id) return;
      if (!durationSeconds || !Number.isFinite(durationSeconds) || durationSeconds <= 0) return;

      const rounded = Math.round(durationSeconds);
      setDisplayDuration(rounded);
      if (video && Math.abs((video.duration || 0) - rounded) < 2) {
        // Already close enough, skip update
        return;
      }

      fetch(`/api/videos/${id}/duration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ duration: rounded })
      })
        .then(async (res) => {
          if (!res.ok) return;
          const updated = await res.json();
          updateVideo(updated);
        })
        .catch((err) => {
          console.error('Failed to update duration', err);
        });
    },
    [id, video, updateVideo]
  );

  if (!video) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold text-white">Video not found</h2>
        <button 
          onClick={() => navigate('/')}
          className="text-primary hover:text-primary/80"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="w-full bg-card rounded-3xl overflow-hidden shadow-2xl p-4 md:p-6">
        <VideoPlayer video={video} autoplay={true} onDurationKnown={handleDurationKnown} />
        
        <div className="mt-6 space-y-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white">{video.title}</h1>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-700">
            <div className="flex items-center space-x-4 text-slate-400">
              <div className="flex items-center space-x-1">
                <Eye size={18} />
                <span>{video.analytics.views.toLocaleString()} views</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock size={18} />
                <span>
                  {displayDuration != null
                    ? `${Math.floor(displayDuration / 60)} mins`
                    : `${Math.floor((video.duration || 0) / 60)} mins`}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-full transition-colors text-white">
                <ThumbsUp size={18} />
                <span>Like</span>
              </button>
              <button className="flex items-center space-x-2 bg-primary hover:bg-primary/90 px-4 py-2 rounded-full transition-colors text-white font-medium shadow-lg shadow-primary/25">
                <Share2 size={18} />
                <span>Share</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 pt-2">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center font-bold text-white text-lg">
                  {video.uploadedBy[0]}
                </div>
                <div>
                  <h4 className="font-bold text-white">{video.uploadedBy}</h4>
                  <p className="text-xs text-slate-400">Uploaded on {new Date(video.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <p className="text-slate-300 leading-relaxed bg-slate-800/30 p-4 rounded-xl">
                {video.description}
              </p>
            </div>
            
            {/* Suggested / Debug Info */}
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <h3 className="font-semibold text-white mb-3">Debug Info</h3>
              <div className="space-y-2 text-sm text-slate-400 font-mono">
                <div className="flex justify-between">
                  <span>Device:</span>
                  <span className="text-primary">{deviceType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transformation:</span>
                  <span className="text-green-400">
                    {deviceType === 'desktop' ? 'ar-16-9' : deviceType === 'mobile' ? 'ar-9-16' : 'ar-4-3'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};