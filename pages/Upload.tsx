import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVideos } from '../context/VideoContext';
import { Video } from '../types';
import { SAMPLE_VIDEO_URL, SAMPLE_THUMBNAIL } from '../constants';
import { UploadCloud, CheckCircle, Loader2 } from 'lucide-react';

export const Upload: React.FC = () => {
  const navigate = useNavigate();
  const { addVideo } = useVideos();
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    uploader: 'User'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    // Simulate network delay and backend processing
    setTimeout(() => {
      const newVideo: Video = {
        _id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        originalUrl: SAMPLE_VIDEO_URL, // In real app, this comes from ImageKit response
        thumbnailUrl: SAMPLE_THUMBNAIL,
        uploadedBy: formData.uploader,
        createdAt: new Date().toISOString(),
        duration: Math.floor(Math.random() * 600) + 60,
        size: 50000000,
        analytics: {
          views: 0,
          devices: { desktop: 0, tablet: 0, mobile: 0 },
          watchTime: 0
        }
      };

      addVideo(newVideo);
      setIsUploading(false);
      navigate('/');
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Upload Video</h1>
        <p className="text-slate-400">
          StreamFlex will automatically generate optimized versions for all devices.
        </p>
      </div>

      <div className="bg-card p-6 md:p-8 rounded-2xl border border-slate-800 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-800/20 hover:bg-slate-800/40 transition-colors cursor-pointer group">
            <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <UploadCloud size={32} />
            </div>
            <p className="text-slate-300 font-medium">Click to upload or drag and drop</p>
            <p className="text-slate-500 text-sm mt-1">MP4, MOV up to 2GB</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Video Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="e.g., Summer Vacation 2024"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
              <textarea
                rows={4}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                placeholder="Tell viewers about your video..."
              />
            </div>
            
             <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Uploader Name</label>
              <input
                type="text"
                required
                value={formData.uploader}
                onChange={(e) => setFormData({ ...formData, uploader: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isUploading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <Loader2 className="animate-spin" />
                  <span>Processing & Transcoding...</span>
                </>
              ) : (
                <>
                  <CheckCircle />
                  <span>Publish Video</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};