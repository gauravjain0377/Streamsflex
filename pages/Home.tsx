import React from 'react';
import { Link } from 'react-router-dom';
import { useVideos } from '../context/VideoContext';
import { Play } from 'lucide-react';

const VideoCard = ({ video }: { video: any }) => (
  <Link to={`/watch/${video._id}`} className="group block">
    <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-800 mb-3 shadow-lg group-hover:shadow-primary/20 transition-all duration-300">
      <img 
        src={video.thumbnailUrl} 
        alt={video.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300">
          <Play fill="white" className="text-white ml-1" size={20} />
        </div>
      </div>
      <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-xs font-mono text-white">
        {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
      </div>
    </div>
    <div>
      <h3 className="font-bold text-lg text-slate-100 leading-tight mb-1 group-hover:text-primary transition-colors">
        {video.title}
      </h3>
      <div className="flex justify-between items-center text-sm text-slate-400">
        <span>{video.uploadedBy}</span>
        <span>{video.analytics.views.toLocaleString()} views</span>
      </div>
    </div>
  </Link>
);

export const Home: React.FC = () => {
  const { videos } = useVideos();

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Discover</h1>
          <p className="text-slate-400">Trending adaptive videos curated for you.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {videos.map(video => (
          <VideoCard key={video._id} video={video} />
        ))}
      </div>
    </div>
  );
};