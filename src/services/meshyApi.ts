import { MeshyPreviewTask } from '../types/meshy';

// IMPORTANT: Required configuration for text-to-3D functionality
const IS_DEV = import.meta.env.DEV;
const PROXY_URL = 'http://localhost:3001';
const MESHY_API_URL = 'https://api.meshy.ai';
const API_BASE_URL = IS_DEV ? `${PROXY_URL}/api` : MESHY_API_URL;
const API_KEY = import.meta.env.VITE_MESHY_API_KEY;

// IMPORTANT: Required headers for Meshy API requests
const headers = {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

interface MeshyError {
  endpoint: string;
  requestData?: any;
  responseStatus?: number;
  responseData?: any;
  error?: any;
}

function logMeshyError(error: MeshyError) {
  console.error('Meshy API Error:', {
    ...error,
    timestamp: new Date().toISOString(),
  });
}

// IMPORTANT: Core text-to-3D generation function
export async function createPreviewTask(
  prompt: string, 
  artStyle: string, 
  negativePrompt?: string,
  topology: 'quad' | 'triangle' = 'quad',
  targetPolycount?: number,
  seed?: number
) {
  // IMPORTANT: Correct endpoint for text-to-3D requests
  const url = IS_DEV ? `${PROXY_URL}/api/text-to-3d` : `${MESHY_API_URL}/v2/text-to-3d`;
  
  // IMPORTANT: Required parameters for text-to-3D generation
  const requestData = {
    mode: 'preview',  // Required - must be lowercase
    prompt,          // Required - object description
    art_style: artStyle,  // Optional
    format: 'glb',   // Required for web compatibility
    // Additional optional parameters
    negative_prompt: negativePrompt,
    topology,
    target_polycount: targetPolycount,
    seed,
    enable_pbr: true,
    ai_model: 'meshy-4'
  };
  
  try {
    console.log('Creating preview task:', { url, requestData });
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestData),
    });

    const data = await response.json();
    console.log('Preview task response:', { status: response.status, data });

    if (!response.ok) {
      logMeshyError({
        endpoint: 'createPreviewTask',
        requestData,
        responseStatus: response.status,
        responseData: data,
      });
      throw new Error(data.message || 'Failed to create preview task');
    }

    return data.result;
  } catch (error) {
    logMeshyError({
      endpoint: 'createPreviewTask',
      requestData,
      error,
    });
    throw error;
  }
}

export async function getTaskStatus(taskId: string): Promise<MeshyPreviewTask> {
  const url = `${API_BASE_URL}/task/${taskId}`;
  const response = await fetch(url, {
    headers
  });
  const data = await response.json();
  return data;
}

export async function proxyFetchModel(url: string): Promise<ArrayBuffer> {
  try {
    console.log('Fetching model:', { url, isDev: IS_DEV });
    
    // Always use proxy in development to avoid CORS
    if (IS_DEV) {
      const proxyUrl = `${PROXY_URL}/api/model?url=${encodeURIComponent(url)}`;
      console.log('Using proxy URL:', proxyUrl);
      
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch model: ${response.statusText}`);
      }
      return response.arrayBuffer();
    }

    // In production, try direct fetch first, fallback to proxy if CORS error
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Accept': 'model/gltf-binary,model/gltf+json,*/*',
        },
        mode: 'cors',
        credentials: 'omit'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch model: ${response.statusText}`);
      }

      return response.arrayBuffer();
    } catch (error) {
      // If CORS error, try using the proxy
      if (error instanceof Error && error.message.includes('CORS')) {
        console.log('CORS error, falling back to proxy');
        const proxyUrl = `${PROXY_URL}/api/model?url=${encodeURIComponent(url)}`;
        const proxyResponse = await fetch(proxyUrl);
        
        if (!proxyResponse.ok) {
          throw new Error(`Failed to fetch model via proxy: ${proxyResponse.statusText}`);
        }
        
        return proxyResponse.arrayBuffer();
      }
      throw error;
    }
  } catch (error) {
    console.error('Error fetching model:', error);
    throw error;
  }
};

// CRITICAL: Image-to-3D Implementation
// WARNING: The following implementation MUST be preserved exactly as is
// DO NOT modify the image data handling or API parameters unless enhancing functionality
// The data URI prefix MUST be preserved for the API to work correctly
export async function createImageTo3DTask(
  image: File,
  options: {
    topology?: 'quad' | 'triangle';
    targetPolycount?: number;
  } = {}
) {
  try {
    console.log('Creating image-to-3D task:', { 
      fileName: image.name, 
      fileSize: image.size,
      options 
    });

    // CRITICAL: Image must be converted to a complete data URI
    // DO NOT remove the data URI prefix (e.g., "data:image/jpeg;base64,")
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // IMPORTANT: Keep the full data URI - required by the API
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(image);
    });

    // CRITICAL: API version must be v1 for image-to-3D
    const url = IS_DEV ? `${PROXY_URL}/api/image-to-3d` : `${MESHY_API_URL}/v1/image-to-3d`;
    
    // CRITICAL: These parameters MUST be provided exactly as shown
    const requestData = {
      image_url: base64Data,  // MUST be complete data URI
      mode: 'preview',        // MUST be 'preview'
      ai_model: 'meshy-4',    // MUST be 'meshy-4'
      topology: options.topology || 'quad',
      target_polycount: options.targetPolycount || 50000,
      enable_pbr: true        // MUST be true
    };

    console.log('Sending request to:', url, {
      ...requestData,
      image_url: '[DATA_URI]' // Log without actual image data
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Image-to-3D task error:', {
        status: response.status,
        statusText: response.statusText,
        data: errorData
      });
      throw new Error(errorData.message || errorData.error || 'Failed to create image-to-3D task');
    }

    const data = await response.json();
    console.log('Image-to-3D task response:', { 
      status: response.status, 
      data: { ...data, result: data.result ? '[TRUNCATED]' : undefined }
    });

    return data.result;
  } catch (error) {
    logMeshyError({
      endpoint: 'createImageTo3DTask',
      requestData: { fileName: image.name, fileSize: image.size, options },
      error,
    });
    throw error;
  }
}