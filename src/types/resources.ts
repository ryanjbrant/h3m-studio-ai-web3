export type Engine = 'Unity' | 'Unreal' | 'WebGL' | 'Cinema' | 'Blender';
export type Category = 'Materials' | 'Effects' | 'Post-Processing' | 'Lighting' | 'Animation';
export type Size = '1x1' | '1x2' | '2x1' | '2x2';
export type ModelType = 'gltf' | 'glb' | 'usdz';

export interface ModelResource {
  modelUrl: string;
  modelType: ModelType;
  binUrl?: string;
  textureUrls?: { [key: string]: string };
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  engine: Engine;
  category: Category;
  likes: number;
  imageUrl: string;
  size: Size;
  model?: ModelResource;
}