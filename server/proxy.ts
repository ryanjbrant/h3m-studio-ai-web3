import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import rateLimit from 'express-rate-limit';

interface MeshyApiResponse {
  message?: string;
  error?: string;
  result?: any;
  taskId?: string;
  status?: string;
  model_urls?: {
    glb?: string;
    fbx?: string;
    usdz?: string;
  };
}

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });

// IMPORTANT: Required configuration for proxy server
const app = express();
const port = process.env.PORT || 3001;
const MESHY_API_BASE_URL = 'https://api.meshy.ai';
const MESHY_API_V1_URL = `${MESHY_API_BASE_URL}/v1`;
const MESHY_API_V2_URL = `${MESHY_API_BASE_URL}/v2`;

// Rate limiting setup - 20 requests per second as per API rules
const limiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 20, // limit each IP to 20 requests per second
  message: { message: 'Too many requests, please try again later' }
});

// Apply rate limiting to all routes
app.use(limiter);

// IMPORTANT: Required middleware for text-to-3D functionality
app.use(cors({
  origin: ['http://localhost:5173', 'https://your-production-domain.com'],
  methods: ['GET', 'POST'],
  credentials: true
}));

// Handle preflight requests
app.options('*', cors());

// Increase payload size limit for requests
app.use(express.json({ limit: '50mb' }));

// Track ongoing requests to prevent duplicates
const ongoingRequests = new Map<string, Promise<any>>();

// IMPORTANT: Core API request handler with retry logic
async function makeApiRequest(endpoint: string, requestData: any = null, method: 'GET' | 'POST' = 'POST', retries = 3) {
  const requestId = `${endpoint}-${Date.now()}`;
  
  // Check if this exact request is already in progress
  if (ongoingRequests.has(requestId)) {
    return ongoingRequests.get(requestId);
  }

  const request = (async () => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const options: any = {
          method,
          headers: {
            'Authorization': `Bearer ${process.env.VITE_MESHY_API_KEY}`,
            'Accept': 'application/json',
          }
        };

        if (method === 'POST') {
          options.headers['Content-Type'] = 'application/json';
          options.body = JSON.stringify(requestData);
        }

        // Use v1 for image-to-3d, v2 for text-to-3d
        const baseUrl = endpoint.startsWith('image-to-3d') ? MESHY_API_V1_URL : MESHY_API_V2_URL;
        const response = await fetch(`${baseUrl}/${endpoint}`, options);

        const data = await response.json() as MeshyApiResponse;
        console.log(`${endpoint} response:`, {
          status: response.status,
          data: { ...data, result: data.result ? '[TRUNCATED]' : undefined }
        });

        if (!response.ok) {
          switch (response.status) {
            case 400:
              throw new Error(data.message || 'Bad Request');
            case 401:
              throw new Error('Invalid API key');
            case 402:
              throw new Error('Insufficient credits');
            case 404:
              throw new Error('Resource not found');
            case 429:
              if (attempt < retries) {
                // Rate limit hit, wait and retry with exponential backoff
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                continue;
              }
              throw new Error('Too many requests');
            default:
              throw new Error(data.message || `API request failed: ${response.statusText}`);
          }
        }

        return data;
      } catch (error) {
        if (attempt === retries) {
          throw error;
        }
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  })();

  ongoingRequests.set(requestId, request);
  try {
    return await request;
  } finally {
    ongoingRequests.delete(requestId);
  }
}

// IMPORTANT: Text to 3D generation endpoint
app.post('/api/text-to-3d', async (req, res) => {
  try {
    console.log('Received text-to-3D request:', {
      ...req.body,
      prompt: req.body.prompt
    });

    if (!req.body.prompt) {
      return res.status(400).json({ 
        message: 'Prompt is required'
      });
    }

    const data = await makeApiRequest('text-to-3d', {
      ...req.body,
      format: 'glb'  // Always use GLB format
    });

    // Return 202 for accepted tasks as per API rules
    res.status(202).json(data);
  } catch (error) {
    console.error('Text-to-3D error:', error);
    // Map error messages to appropriate status codes
    if (error instanceof Error) {
      switch (error.message) {
        case 'Bad Request': return res.status(400).json({ message: error.message });
        case 'Invalid API key': return res.status(401).json({ message: error.message });
        case 'Insufficient credits': return res.status(402).json({ message: error.message });
        case 'Resource not found': return res.status(404).json({ message: error.message });
        case 'Too many requests': return res.status(429).json({ message: error.message });
      }
    }
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// CRITICAL: Image-to-3D Proxy Endpoint
// WARNING: This implementation MUST be preserved exactly as is
// The endpoint MUST forward the complete data URI without modification
app.post('/api/image-to-3d', async (req, res) => {
  try {
    console.log('Received image-to-3D request:', {
      ...req.body,
      image_url: req.body.image_url ? '[DATA_URI]' : undefined
    });

    // CRITICAL: Validate image_url is present and properly formatted
    if (!req.body.image_url) {
      return res.status(400).json({ 
        message: 'Image URL is required'
      });
    }

    // CRITICAL: Forward request to Meshy API with exact parameters
    const data = await makeApiRequest('image-to-3d', {
      ...req.body,
      format: 'glb'  // MUST use GLB format for web compatibility
    }, 'POST');

    // CRITICAL: Return 202 status for accepted tasks as per API specification
    res.status(202).json(data);
  } catch (error) {
    console.error('Image-to-3D error:', error);
    if (error instanceof Error) {
      switch (error.message) {
        case 'Bad Request': return res.status(400).json({ message: error.message });
        case 'Invalid API key': return res.status(401).json({ message: error.message });
        case 'Insufficient credits': return res.status(402).json({ message: error.message });
        case 'Resource not found': return res.status(404).json({ message: error.message });
        case 'Too many requests': return res.status(429).json({ message: error.message });
      }
    }
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Internal server error'
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

    // Set CORS headers
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

    // Fetch the model
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch model: ${response.statusText}`);
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

    // Set appropriate content type
    const contentType = contentTypeMap[fileExtension || 'glb'] || 'application/octet-stream';
    res.set('Content-Type', contentType);

    // Stream the response
    response.body?.pipe(res);
  } catch (error) {
    console.error('Error proxying model:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to proxy model'
    });
  }
});

// IMPORTANT: Task status checking endpoint
app.get('/api/task/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const data = await makeApiRequest(`text-to-3d/${taskId}`, null, 'GET');
    res.json(data);
  } catch (error) {
    console.error('Task status error:', error);
    if (error instanceof Error) {
      switch (error.message) {
        case 'Bad Request': return res.status(400).json({ message: error.message });
        case 'Invalid API key': return res.status(401).json({ message: error.message });
        case 'Resource not found': return res.status(404).json({ message: error.message });
        case 'Too many requests': return res.status(429).json({ message: error.message });
      }
    }
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

app.listen(port, () => {
  console.log(`Proxy server running on port ${port}`);
}); 