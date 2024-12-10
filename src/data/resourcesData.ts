import { Resource } from '../types/resources';

const images = [
  'https://h3mstudio-web.s3.us-west-1.amazonaws.com/shaders/skinner-01.gif',
  'https://h3mstudio-web.s3.us-west-1.amazonaws.com/shaders/skinner-02.gif',
  'https://h3mstudio-web.s3.us-west-1.amazonaws.com/shaders/skinner-03.gif'
];

const engines = ['Unity', 'Unreal', 'WebGL', 'Cinema', 'Blender'] as const;
const categories = ['Materials', 'Effects', 'Post-Processing', 'Lighting', 'Animation'] as const;
const sizes = ['1x1', '1x2', '2x1', '2x2'] as const;

export const generatePlaceholderResources = (count: number): Resource[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `resource-${i + 1}`,
    title: `Resource ${i + 1}`,
    description: `This is a placeholder description for resource ${i + 1}. It demonstrates the capabilities of this shader or resource.`,
    engine: engines[i % engines.length],
    category: categories[i % categories.length],
    likes: Math.floor(Math.random() * 1000),
    imageUrl: images[i % images.length],
    size: sizes[Math.floor(Math.random() * 2)] // Using mostly 1x1 and 1x2 for better layout
  }));
};