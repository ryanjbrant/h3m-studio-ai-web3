export type Engine = 'Unity' | 'Unreal' | 'WebGL' | 'Cinema' | 'Blender';
export type Category = 'Materials' | 'Effects' | 'Post-Processing' | 'Lighting' | 'Animation';
export type Size = '1x1' | '1x2' | '2x1' | '2x2';

export interface Resource {
  id: string;
  title: string;
  description: string;
  engine: Engine;
  category: Category;
  likes: number;
  imageUrl: string;
  size: Size;
}