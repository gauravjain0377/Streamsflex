import React, { useEffect, useRef, useState } from 'react';
import { useDevice } from '../context/DeviceContext';
import { Video, DeviceType } from '../types';
import { getTransformedUrl, getAspectRatioClass } from '../utils/deviceUtils';
import { Maximize2, Minimize2, Volume2, Settings, Play, Pause } from 'lucide-react';

interface VideoPlayerProps {
  video: Video;
  autoplay?: boolean;
  onDurationKnown?: (durationSeconds: number) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, autoplay = false, onDurationKnown }) => {
  const { deviceType } = useDevice();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [transformedUrl, setTransformedUrl] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // Generate the URL with transformation parameters
    const url = getTransformedUrl(video.originalUrl, deviceType);
    setTransformedUrl(url);
    setIsLoaded(false);
    setCurrentTime(0);
  }, [video, deviceType]);

  const aspectRatioClass = getAspectRatioClass(deviceType);

  // Keep fullscreen state in sync with browser
  useEffect(() => {
    const handleFsChange = () => {
      const el = document.fullscreenElement || (document as any).webkitFullscreenElement;
      setIsFullscreen(el === containerRef.current);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    // Safari
    document.addEventListener('webkitfullscreenchange', handleFsChange as any);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange as any);
    };
  }, []);

  const toggleFullscreen = () => {
    const node = containerRef.current || videoRef.current;
    if (!node) return;
    const anyDoc = document as any;
    if (document.fullscreenElement === node || anyDoc.webkitFullscreenElement === node) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (anyDoc.webkitExitFullscreen) {
        anyDoc.webkitExitFullscreen();
      }
    } else {
      const anyNode = node as any;
      if (anyNode.requestFullscreen) {
        anyNode.requestFullscreen();
      } else if (anyNode.webkitRequestFullscreen) {
        anyNode.webkitRequestFullscreen();
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    const durationSeconds = videoRef.current.duration;
    if (Number.isFinite(durationSeconds) && durationSeconds > 0) {
      setDuration(durationSeconds);
      if (onDurationKnown) {
        onDurationKnown(durationSeconds);
      }
    }
    setIsLoaded(true);
    if (autoplay) {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current || !duration) return;
    const value = Number(e.target.value);
    const newTime = (value / 100) * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setVolume(value);
    if (videoRef.current) {
      videoRef.current.volume = value;
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    setShowSettings(false);
  };

  const formatTime = (time: number) => {
    if (!Number.isFinite(time) || time < 0) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={`relative group w-full bg-black rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 ease-in-out ${
      deviceType === DeviceType.MOBILE ? 'max-w-sm mx-auto' : 
      deviceType === DeviceType.TABLET ? 'max-w-2xl mx-auto' : 'w-full'
    }`}>
      {/* Aspect Ratio Container */}
      <div
        className={`relative w-full ${aspectRatioClass} bg-slate-900 flex items-center justify-center`}
        onClick={togglePlay}
      >
        <video
          ref={videoRef}
          src={transformedUrl}
          className="w-full h-full object-cover"
          autoPlay={false}
          preload="auto"
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          poster={video.thumbnailUrl} // In real app, poster would also be transformed
        >
          Your browser does not support the video tag.
        </video>

        {/* Center play / pause button */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="pointer-events-auto w-16 h-16 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white shadow-lg transition-colors"
          >
            {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
          </button>
        </div>

        {/* Overlay Info (Optional - Fades in on hover) */}
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Stream Mode: {deviceType.toUpperCase()}
        </div>
      </div>

      {/* Custom Controls */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent px-4 pb-3 pt-2">
        {/* Progress bar */}
        <div className="flex items-center space-x-3 text-xs text-slate-200 mb-2">
          <span className="font-mono">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={100}
            value={progressPercent}
            onChange={handleSeek}
            className="flex-1 accent-primary"
          />
          <span className="font-mono">{formatTime(duration || video.duration)}</span>
        </div>

        {/* Bottom controls row */}
        <div className="flex items-center justify-between text-sm text-white">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={togglePlay}
              className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-xs font-medium"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <div className="flex items-center space-x-2">
              <Volume2 size={16} />
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={handleVolumeChange}
                className="w-24 accent-primary"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <button
                type="button"
                className="p-1 rounded hover:bg-white/10 transition-colors"
                onClick={() => setShowSettings((v) => !v)}
              >
                <Settings size={18} />
              </button>
              {showSettings && (
                <div className="absolute right-0 bottom-8 bg-slate-900 border border-slate-700 rounded-lg shadow-lg text-xs">
                  {[
                    { label: '0.5x', value: 0.5 },
                    { label: '1x', value: 1 },
                    { label: '1.5x', value: 1.5 },
                    { label: '2x', value: 2 }
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handlePlaybackRateChange(opt.value)}
                      className="block w-full text-left px-3 py-1 hover:bg-slate-800"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              className="p-1 rounded hover:bg-white/10 transition-colors"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};