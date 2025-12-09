import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVideos } from '../context/VideoContext';
import { apiUrl } from '../utils/api';
import { Video } from '../types';
import { UploadCloud, CheckCircle, Loader2 } from 'lucide-react';

export const Upload: React.FC = () => {
  const navigate = useNavigate();
  const { addVideo } = useVideos();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const thumbInputRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    uploader: 'User'
  });

  const MAX_FILE_SIZE_MB = 200;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!videoFile) {
      setError('Please select a video file to upload.');
      return;
    }

    if (videoFile.size > MAX_FILE_SIZE_BYTES) {
      setError(`Video is too large. Maximum allowed size is ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const body = new FormData();
      body.append('video', videoFile);
      if (thumbnailFile) {
        body.append('thumbnail', thumbnailFile);
      }
      body.append('title', formData.title);
      body.append('description', formData.description);
      body.append('uploader', formData.uploader);

      const created: Video = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', apiUrl('/api/videos'));

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percent);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const json = JSON.parse(xhr.responseText);
              resolve(json as Video);
            } catch {
              reject(new Error('Invalid server response'));
            }
          } else {
            let message = 'Upload failed';
            try {
              const parsed = JSON.parse(xhr.responseText);
              if (parsed?.message) message = parsed.message;
            } catch {
          
            }
            reject(new Error(message));
          }
        };

        xhr.onerror = () => {
          reject(new Error('Network error during upload'));
        };

        xhr.send(body);
      });

      addVideo(created);
      navigate('/');
    } catch (err: any) {
      console.error('Upload error', err);
      setError(err?.message || 'Failed to upload video. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
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
          <div
            className="border-2 border-dashed border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-800/20 hover:bg-slate-800/40 transition-colors cursor-pointer group"
            onClick={() => videoInputRef.current?.click()}
          >
            <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <UploadCloud size={32} />
            </div>
            <p className="text-slate-300 font-medium">Click to upload or drag and drop</p>
            <p className="text-slate-500 text-sm mt-1">MP4, MOV up to 200 MB</p>
            {videoFile && (
              <p className="text-slate-400 text-xs mt-3">
                Selected video: <span className="font-medium text-slate-200">{videoFile.name}</span>
              </p>
            )}
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/quicktime"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setVideoFile(file);
                setError(null);
              }}
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Thumbnail Image (optional)
              </label>
              <div
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-300 text-sm flex items-center justify-between cursor-pointer hover:border-primary transition-colors"
                onClick={() => thumbInputRef.current?.click()}
              >
                <span>
                  {thumbnailFile ? `Selected thumbnail: ${thumbnailFile.name}` : 'Click to select an image'}
                </span>
                <span className="text-xs text-slate-500 ml-4">
                  If not provided, first second of the video will be used.
                </span>
              </div>
              <input
                ref={thumbInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setThumbnailFile(file);
                }}
              />
            </div>

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
            {typeof uploadProgress === 'number' && (
              <p className="text-slate-400 text-xs mt-2">
                Uploading... {uploadProgress}%
              </p>
            )}
            {error && (
              <p className="text-red-400 text-sm mt-3">
                {error}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};