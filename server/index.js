import express from 'express';
import cors from 'cors';
import multer from 'multer';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- MongoDB connection ---
if (!process.env.MONGODB_URI) {
  console.warn('MONGODB_URI is not set. Please configure it in your .env file.');
}

mongoose
  .connect(process.env.MONGODB_URI || '', {
    dbName: 'StreamFlex'
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error', err));

// --- Cloudinary setup ---
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.warn('Cloudinary environment variables are not fully set. Uploads will fail until they are configured.');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || ''
});

// --- Multer (in-memory) ---
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024 // 2GB
  }
});

// --- Mongoose schema & model ---
const analyticsSchema = new mongoose.Schema(
  {
    views: { type: Number, default: 0 },
    devices: {
      desktop: { type: Number, default: 0 },
      tablet: { type: Number, default: 0 },
      mobile: { type: Number, default: 0 }
    },
    watchTime: { type: Number, default: 0 } // seconds
  },
  { _id: false }
);

const videoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    originalUrl: { type: String, required: true }, // Cloudinary video URL
    thumbnailUrl: { type: String, required: true }, // Cloudinary image URL
    uploadedBy: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    duration: { type: Number, default: 0 }, // seconds
    size: { type: Number, default: 0 }, // bytes
    likes: { type: Number, default: 0 },
    analytics: { type: analyticsSchema, default: () => ({}) },
    cloudinaryPublicId: { type: String },           // for video
    cloudinaryThumbnailPublicId: { type: String }   // for user-uploaded thumbnail
  },
  {
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        // Normalize _id to string
        ret._id = ret._id.toString();
      }
    }
  }
);

const Video = mongoose.model('Video', videoSchema);

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Routes ---
// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Get all videos (newest first)
app.get('/api/videos', async (_req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 }).lean();
    // Ensure string ids
    const normalized = videos.map((v) => ({
      ...v,
      _id: v._id.toString()
    }));
    res.json(normalized);
  } catch (err) {
    console.error('Failed to fetch videos', err);
    res.status(500).json({ message: 'Failed to fetch videos' });
  }
});

// Upload video + optional thumbnail
app.post(
  '/api/videos',
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const videoFile = req.files?.video?.[0];
      const thumbnailFile = req.files?.thumbnail?.[0];
      const { title, description, uploader } = req.body;

      if (!videoFile) {
        return res.status(400).json({ message: 'Video file is required' });
      }

      if (!title || !description) {
        return res.status(400).json({ message: 'Title and description are required' });
      }

      // 1) Upload raw video file to Cloudinary (as video)
      const videoUploadResponse = await cloudinary.uploader.upload(
        `data:${videoFile.mimetype};base64,${videoFile.buffer.toString('base64')}`,
        {
          resource_type: 'video',
          folder: 'streamflex/videos',
          use_filename: true,
          unique_filename: true
        }
      );

      // 2) Handle thumbnail
      let thumbnailUrl;
      let thumbnailPublicId;

      if (thumbnailFile) {
        // Case 1: user uploaded a thumbnail image
        const thumbUploadResponse = await cloudinary.uploader.upload(
          `data:${thumbnailFile.mimetype};base64,${thumbnailFile.buffer.toString('base64')}`,
          {
            folder: 'streamflex/thumbnails',
            use_filename: true,
            unique_filename: true,
            resource_type: 'image'
          }
        );
        thumbnailUrl = thumbUploadResponse.secure_url;
        thumbnailPublicId = thumbUploadResponse.public_id;
      } else {
        // Case 2: no thumbnail uploaded – use first-second frame from the video
        thumbnailUrl = cloudinary.url(`${videoUploadResponse.public_id}.jpg`, {
          resource_type: 'video',
          secure: true,
          transformation: [
            { width: 800, height: 450, crop: 'fill', gravity: 'auto' },
            { quality: 'auto', fetch_format: 'jpg' },
            { start_offset: '1' }
          ]
        });
      }

      // 3) Store in MongoDB
      const doc = await Video.create({
        title,
        description,
        originalUrl: videoUploadResponse.secure_url, // Cloudinary video URL
        thumbnailUrl,
        uploadedBy: uploader || 'User',
        size: videoFile.size,
        cloudinaryPublicId: videoUploadResponse.public_id,
        cloudinaryThumbnailPublicId: thumbnailPublicId
      });

      const json = doc.toJSON();
      res.status(201).json(json);
    } catch (err) {
      console.error('Upload failed', err);
      res.status(500).json({ message: 'Failed to upload video' });
    }
  }
);

// Increment view + device counts
app.post('/api/videos/:id/view', async (req, res) => {
  try {
    const { id } = req.params;
    const { device } = req.body || {};

    if (!['desktop', 'tablet', 'mobile'].includes(device)) {
      return res.status(400).json({ message: 'Invalid device type' });
    }

    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    video.analytics.views += 1;
    video.analytics.devices[device] += 1;

    await video.save();

    const json = video.toJSON();
    res.json(json);
  } catch (err) {
    console.error('Failed to increment view', err);
    res.status(500).json({ message: 'Failed to increment view' });
  }
});

// Update duration (in seconds)
app.post('/api/videos/:id/duration', async (req, res) => {
  try {
    const { id } = req.params;
    let { duration } = req.body || {};

    duration = Number(duration);
    if (!Number.isFinite(duration) || duration <= 0) {
      return res.status(400).json({ message: 'Invalid duration value' });
    }

    const rounded = Math.round(duration);

    const video = await Video.findByIdAndUpdate(
      id,
      { duration: rounded },
      { new: true }
    );

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const json = video.toJSON();
    res.json(json);
  } catch (err) {
    console.error('Failed to update duration', err);
    res.status(500).json({ message: 'Failed to update duration' });
  }
});

// Increment likes
app.post('/api/videos/:id/like', async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    video.likes = (video.likes || 0) + 1;

    await video.save();

    const json = video.toJSON();
    res.json(json);
  } catch (err) {
    console.error('Failed to increment like', err);
    res.status(500).json({ message: 'Failed to increment like' });
  }
});

// Root route for friendly message
app.get('/', (_req, res) => {
  res.send('Streamsflex API is running');
});

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});


