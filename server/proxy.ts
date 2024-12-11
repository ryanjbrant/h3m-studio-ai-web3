import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

interface MeshyApiResponse {
  message?: string;
  taskId?: string;
  status?: string;
  error?: string;
  result?: string;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });

const app = express();
const port = process.env.PORT || 3001;
const MESHY_API_URL = 'https://api.meshy.ai/v2';

// Configure CORS to only allow requests from your frontend
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Content-Length', 'Accept', 'Range'],
  exposedHeaders: ['Content-Type', 'Content-Length', 'Content-Range', 'Accept-Ranges'],
  credentials: true,
  maxAge: 86400 // 24 hours
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json({ limit: '50mb' }));

// Text to 3D endpoint
app.post('/api/text2mesh', async (req, res) => {
  try {
    const response = await fetch(`${MESHY_API_URL}/text-to-3d`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VITE_MESHY_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        ...req.body,
        mode: 'preview'
      }),
    });

    const data = await response.json() as MeshyApiResponse;
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create text2mesh task');
    }

    res.json(data);
  } catch (error) {
    console.error('Text2Mesh error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to create text2mesh task' 
    });
  }
});

// Get task status endpoint
app.get('/api/text2mesh/:taskId', async (req, res) => {
  try {
    const response = await fetch(`${MESHY_API_URL}/text-to-3d/${req.params.taskId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.VITE_MESHY_API_KEY}`,
        'Accept': 'application/json',
      },
    });

    const data = await response.json() as MeshyApiResponse;
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get task status');
    }

    res.json(data);
  } catch (error) {
    console.error('Task status error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to get task status' 
    });
  }
});

// Image to 3D endpoint
app.post('/api/image-to-3d', async (req, res) => {
  try {
    const response = await fetch(`${MESHY_API_URL}/image-to-3d`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VITE_MESHY_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        ...req.body,
        mode: 'preview'
      }),
    });

    const data = await response.json() as MeshyApiResponse;
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create image-to-3D task');
    }

    res.json(data);
  } catch (error) {
    console.error('Image-to-3D error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to create image-to-3D task' 
    });
  }
});

// Proxy model fetch endpoint
app.get('/api/model', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL is required' });
    }

    console.log('Proxying model request for:', url);

    // Set CORS headers for the preflight request
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Range',
      'Access-Control-Expose-Headers': 'Content-Range, Accept-Ranges',
    });

    // Handle preflight request
    if (req.method === 'OPTIONS') {
      return res.status(204).send();
    }

    // Determine content type based on file extension
    const fileExtension = url.split('.').pop()?.toLowerCase().split('?')[0];
    const contentTypeMap: { [key: string]: string } = {
      'glb': 'model/gltf-binary',
      'gltf': 'model/gltf+json',
      'obj': 'text/plain',
      'mtl': 'text/plain',
      'fbx': 'application/octet-stream',
      'usdz': 'model/vnd.usdz+zip',
    };

    console.log('Fetching model with extension:', fileExtension);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${process.env.VITE_MESHY_API_KEY}`,
        'Accept': contentTypeMap[fileExtension || ''] || '*/*',
        'Range': req.headers.range || '',
      },
    });

    console.log('Model fetch response:', {
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length'),
      fileExtension
    });

    // Special handling for 403 errors on MTL files - return empty MTL
    if (response.status === 403 && fileExtension === 'mtl') {
      res.setHeader('Content-Type', 'text/plain');
      return res.send('# Empty MTL file\n');
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch model: ${response.statusText} (${response.status})`);
    }

    // Forward relevant headers from the original response
    const headers = [
      'content-type',
      'content-length',
      'content-range',
      'accept-ranges',
      'cache-control',
      'expires',
      'last-modified',
      'etag'
    ];

    headers.forEach(header => {
      const value = response.headers.get(header);
      if (value) {
        res.setHeader(header, value);
      }
    });

    // Set content type if not provided by the response
    if (!response.headers.get('content-type') && fileExtension) {
      const contentType = contentTypeMap[fileExtension];
      if (contentType) {
        res.setHeader('Content-Type', contentType);
      }
    }

    // For GLB files, ensure proper content type and transfer
    if (fileExtension === 'glb') {
      res.setHeader('Content-Type', 'model/gltf-binary');
      
      // Get the response as an array buffer
      const buffer = await response.arrayBuffer();
      console.log('GLB file size:', buffer.byteLength);
      
      // Send the buffer directly
      return res.send(Buffer.from(buffer));
    }

    // Stream other file types
    response.body?.pipe(res);
  } catch (error) {
    console.error('Error proxying model:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to proxy model request' 
    });
  }
});

app.listen(port, () => {
  console.log(`Proxy server running on port ${port}`);
}); 