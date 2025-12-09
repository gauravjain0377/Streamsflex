import React, { useEffect, useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVideos } from '../context/VideoContext';
import { apiUrl } from '../utils/api';
import { useDevice } from '../context/DeviceContext';
import { VideoPlayer } from '../components/VideoPlayer';
import { Share2, ThumbsUp, Eye, Clock, X as Close } from 'lucide-react';

export const Watch: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getVideoById, incrementView, updateVideo, deleteVideo } = useVideos();
  const { deviceType } = useDevice();
  
  const video = getVideoById(id || '');
  const [displayDuration, setDisplayDuration] = useState<number | null>(video?.duration ?? null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false); // NEW
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

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

      fetch(apiUrl(`/api/videos/${id}/duration`), {
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

  const handleLike = async () => {
    if (!video || isLiking) return;
    setIsLiking(true);

    // Optimistic update
    updateVideo({ ...video, likes: (video.likes || 0) + 1 });

    try {
      const res = await fetch(apiUrl(`/api/videos/${video._id}/like`), {
        method: 'POST'
      });
      if (res.ok) {
        const updated = await res.json();
        updateVideo(updated);
      }
    } catch (err) {
      console.error('Failed to like video', err);
    } finally {
      setIsLiking(false);
    }
  };

  // Open pretty delete modal instead of browser alert
  const handleDelete = () => {
    if (!video || !id || isDeleting) return;
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!video || !id || isDeleting) return;

    try {
      setIsDeleting(true);
      await deleteVideo(id);
      setIsDeleteOpen(false);
      navigate('/');
    } catch (err) {
      console.error('Failed to delete video', err);
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    if (isDeleting) return;
    setIsDeleteOpen(false);
  };

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/#/watch/${video?._id}`
      : '';
  const shareText = `${video?.title || 'StreamFlex video'} — watch now on StreamFlex`;

  const handleNativeShare = async () => {
    if (!shareUrl || !video) return;
    if ((navigator as any).share) {
      try {
        await (navigator as any).share({
          title: video.title,
          text: shareText,
          url: shareUrl
        });
      } catch (err) {
        console.error('Native share cancelled or failed', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopyMessage('Link copied to clipboard');
        setTimeout(() => setCopyMessage(null), 2000);
      } catch (err) {
        console.error('Failed to copy link', err);
      }
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyMessage('Link copied to clipboard');
      setTimeout(() => setCopyMessage(null), 2000);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

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
              <button
                onClick={handleLike}
                disabled={isLiking}
                className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-full transition-colors text-white disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <ThumbsUp size={18} />
                <span>{(video.likes || 0).toLocaleString()} Likes</span>
              </button>
              <button
                onClick={() => setIsShareOpen(true)}
                className="flex items-center space-x-2 bg-primary hover:bg-primary/90 px-4 py-2 rounded-full transition-colors text-white font-medium shadow-lg shadow-primary/25"
              >
                <Share2 size={18} />
                <span>Share</span>
              </button>

              {video.cloudinaryPublicId && (
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full transition-colors text-white font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
                </button>
              )}
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

      {isShareOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-white">Share this video</h3>
              <button
                type="button"
                onClick={() => setIsShareOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <Close size={18} />
              </button>
            </div>
            <p className="text-slate-400 text-sm">
              Share with friends on your favourite platforms or copy the link.
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleNativeShare}
                className="w-full bg-primary hover:bg-primary/90 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
              >
                Share using system share
              </button>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-lg py-2.5 text-center font-medium transition-colors"
                >
                  WhatsApp
                </a>
                <a
                  href={`https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(
                    shareUrl
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 rounded-lg py-2.5 text-center font-medium transition-colors"
                >
                  X (Twitter)
                </a>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="col-span-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg py-2.5 text-center font-medium transition-colors"
                >
                  Copy link
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-400 break-all">
                {shareUrl}
              </div>

              {copyMessage && (
                <p className="text-xs text-emerald-400 mt-1">{copyMessage}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* NEW: Delete confirmation modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-white">Delete this video?</h3>
              <button
                type="button"
                onClick={handleCancelDelete}
                className="text-slate-400 hover:text-slate-200"
              >
                <Close size={18} />
              </button>
            </div>
            <p className="text-slate-400 text-sm">
              This will permanently delete <span className="text-white font-semibold">{video.title}</span>{' '}
              from your library. This action cannot be undone.
            </p>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-full text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-100 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-full text-sm font-medium bg-red-600 hover:bg-red-700 text-white disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};