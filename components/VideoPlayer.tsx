import React, { useEffect, useRef, useState } from 'react';
import { useDevice } from '../context/DeviceContext';
import { Video, DeviceType } from '../types';
import { getTransformedUrl, getAspectRatioClass } from '../utils/deviceUtils';
import { Maximize2, Volume2, Settings } from 'lucide-react';

interface VideoPlayerProps {
  video: Video;
  autoplay?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, autoplay = false }) => {
  const { deviceType } = useDevice();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [transformedUrl, setTransformedUrl] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Generate the URL with transformation parameters
    const url = getTransformedUrl(video.originalUrl, deviceType);
    setTransformedUrl(url);
    setIsLoaded(false);
  }, [video, deviceType]);

  const aspectRatioClass = getAspectRatioClass(deviceType);

  return (
    <div className={`relative group w-full bg-black rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 ease-in-out ${
      deviceType === DeviceType.MOBILE ? 'max-w-sm mx-auto' : 
      deviceType === DeviceType.TABLET ? 'max-w-2xl mx-auto' : 'w-full'
    }`}>
      {/* Aspect Ratio Container */}
      <div className={`relative w-full ${aspectRatioClass} bg-slate-900 flex items-center justify-center`}>
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500 animate-pulse z-10">
            Loading {deviceType} stream...
          </div>
        )}
        
        <video
          ref={videoRef}
          src={transformedUrl}
          className="w-full h-full object-cover"
          controls
          autoPlay={autoplay}
          onLoadedData={() => setIsLoaded(true)}
          poster={video.thumbnailUrl} // In real app, poster would also be transformed
        >
          Your browser does not support the video tag.
        </video>

        {/* Overlay Info (Optional - Fades in on hover) */}
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Stream Mode: {deviceType.toUpperCase()}
        </div>
      </div>

      {/* Custom Controls Bar Simulation (just visual flair) */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-end px-4 py-3 justify-between">
        <div className="text-white text-sm font-medium">{video.title}</div>
        <div className="flex space-x-3 text-white">
          <Settings size={18} />
          <Maximize2 size={18} />
        </div>
      </div>
    </div>
  );
};