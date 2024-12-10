const MESHY_API_URL = 'https://api.meshy.ai';
const API_KEY = 'msy_Zeid206soTeJFwk9HaBPUqWmzMc8M2ZLQHL5';

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
  const response = await fetch(`${MESHY_API_URL}/v2/text-to-3d`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      mode: 'preview',
      prompt,
      art_style: artStyle,
      negative_prompt: negativePrompt,
      topology,
      target_polycount: targetPolycount,
      seed,
      ai_model: 'meshy-4'
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create preview task');
  }

  const data = await response.json();
  return data.result;
}

export async function getTaskStatus(taskId: string) {
  const response = await fetch(`${MESHY_API_URL}/v2/text-to-3d/${taskId}`, {
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get task status');
  }

  return response.json();
}

export async function fetchModelWithAuth(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'model/gltf-binary,model/gltf+json,*/*',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch model: ${response.statusText}`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error fetching model:', error);
    throw error;
  }
}