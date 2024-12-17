import express, { Request } from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { convertUsdzToGlb } from './converter.js';
import fs from 'fs';
import { ParsedQs } from 'qs';
import fetch from 'node-fetch';
import { pipeline } from 'stream/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

// Ensure public directory exists
const publicDir = path.join(__dirname, '../../public');
const uploadsDir = path.join(publicDir, 'uploads');
fs.mkdirSync(publicDir, { recursive: true });
fs.mkdirSync(uploadsDir, { recursive: true });

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Middleware
app.use(cors());
app.use(express.json());
app.use('/public', express.static(publicDir));

interface FileRequest extends Request {
  file?: Express.Multer.File;
}

// Proxy endpoint for fetching models
app.get('/api/model', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    // Decode the URL to handle Firebase Storage URLs correctly
    const decodedUrl = decodeURIComponent(url);
    console.log('Fetching model from:', decodedUrl);

    const response = await fetch(decodedUrl, {
      headers: {
        'Accept': 'application/octet-stream',
        'Accept-Encoding': 'gzip, deflate, br'
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch model: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch model: ${response.statusText}`);
    }

    // Forward the content type
    res.set('Content-Type', response.headers.get('content-type') || 'application/octet-stream');
    
    // Stream the response
    if (!response.body) {
      throw new Error('No response body');
    }
    await pipeline(
      response.body,
      res
    );
  } catch (error) {
    console.error('Error fetching model:', error);
    res.status(500).json({ error: 'Failed to fetch model' });
  }
});

// Routes
app.post('/api/convert/usdz-to-glb', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const inputPath = req.file.path;
    const outputPath = path.join(uploadsDir, `${path.parse(req.file.originalname).name}.glb`);

    await convertUsdzToGlb(inputPath, outputPath);

    // Send the converted file
    res.download(outputPath, `${path.parse(req.file.originalname).name}.glb`, (err) => {
      // Clean up files after sending
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
      if (err) console.error('Error sending file:', err);
    });
  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({ error: 'Conversion failed' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 