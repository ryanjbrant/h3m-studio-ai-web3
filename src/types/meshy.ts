export interface MeshyPreviewTask {
  id: string;
  model_urls: {
    glb: string;
    fbx?: string;
    usdz?: string;
    obj?: string;
    mtl?: string;
  };
  thumbnail_url: string;
  prompt: string;
  art_style: string;
  negative_prompt: string;
  progress: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED' | 'EXPIRED';
  task_error?: {
    message: string;
  };
  started_at: number;
  created_at: number;
  finished_at: number;
  texture_urls: Array<{
    base_color: string;
  }>;
}

export interface MeshyRefineTask extends MeshyPreviewTask {
  texture_richness: 'high' | 'medium' | 'low' | 'none';
}

export type ArtStyle = 'realistic' | 'cartoon' | 'low-poly' | 'sculpture' | 'pbr';
export type TextureRichness = 'high' | 'medium' | 'low' | 'none';