import { MeshyPreviewTask } from '../types/meshy';

const IS_DEV = import.meta.env.DEV;
const PROXY_URL = 'http://localhost:3001';
const MESHY_API_URL = 'https://api.meshy.ai';
const API_BASE_URL = IS_DEV ? `${PROXY_URL}/api` : MESHY_API_URL;
const API_KEY = import.meta.env.VITE_MESHY_API_KEY;

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

const headers = {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
};

export async function createPreviewTask(
  prompt: string, 
  artStyle: string, 
  negativePrompt?: string,
  topology: 'quad' | 'triangle' = 'quad',
  targetPolycount?: number,
  seed?: number
) {
  const url = IS_DEV ? `${PROXY_URL}/api/text2mesh` : `${MESHY_API_URL}/v2/text-to-3d`;
  const requestData = {
    prompt,
    art_style: artStyle,
    negative_prompt: negativePrompt,
    topology,
    target_polycount: targetPolycount,
    seed,
    mode: 'preview',
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

export const getTaskStatus = async (taskId: string): Promise<MeshyPreviewTask> => {
  const url = `${API_BASE_URL}/text2mesh/${taskId}`;
  console.log('Getting task status:', { url, taskId });
  
  try {
    const response = await fetch(url, {
      headers
    });
    if (!response.ok) {
      throw new Error(`Failed to get task status: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Task status response:', data);
    
    if (!data) {
      throw new Error('Invalid task status response');
    }
    
    // Convert the direct response to MeshyPreviewTask format
    return {
      id: data.id,
      model_urls: data.model_urls || {},
      thumbnail_url: data.thumbnail_url || '',
      prompt: data.prompt || '',
      art_style: data.art_style || 'realistic',
      negative_prompt: data.negative_prompt || '',
      progress: data.progress || 0,
      status: data.status || 'PENDING',
      task_error: data.task_error,
      started_at: data.started_at || Date.now(),
      created_at: data.created_at || Date.now(),
      finished_at: data.finished_at || Date.now(),
      texture_urls: data.texture_urls || []
    };
  } catch (error) {
    console.error('Error getting task status:', error);
    throw error;
  }
};

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

    // Convert image file to base64
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(image);
    });

    const url = IS_DEV ? `${PROXY_URL}/api/image-to-3d` : `${MESHY_API_URL}/v2/image-to-3d`;
    const requestData = {
      image_url: base64,
      mode: 'preview',
      ai_model: 'meshy-4',
      topology: options.topology,
      target_polycount: options.targetPolycount,
      enable_pbr: true
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestData),
    });

    const data = await response.json();
    console.log('Image-to-3D task response:', { status: response.status, data });

    if (!response.ok) {
      logMeshyError({
        endpoint: 'createImageTo3DTask',
        requestData: { ...requestData, image_url: '[BASE64_DATA]' },
        responseStatus: response.status,
        responseData: data,
      });
      throw new Error(data.message || 'Failed to create image-to-3D task');
    }

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