import * as THREE from 'three';
import { TextureSettings } from '../types';

export interface GeneratedMaps {
  normal: ImageData;
  displacement: ImageData;
  specular: ImageData;
  ao: ImageData;
}

export async function generateMaps(
  sourceImage: HTMLImageElement,
  settings: TextureSettings
): Promise<GeneratedMaps> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  canvas.width = sourceImage.width;
  canvas.height = sourceImage.height;
  ctx.drawImage(sourceImage, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  return {
    normal: generateNormalMap(imageData, settings.normal),
    displacement: generateDisplacementMap(imageData, settings.displacement),
    specular: generateSpecularMap(imageData, settings.specular),
    ao: generateAOMap(imageData, settings.ao),
  };
}

function generateNormalMap(imageData: ImageData, settings: TextureSettings['normal']): ImageData {
  const { width, height, data } = imageData;
  const output = new ImageData(width, height);
  const strength = settings.strength / 100;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const left = getHeightValue(data, x - 1, y, width, height);
      const right = getHeightValue(data, x + 1, y, width, height);
      const top = getHeightValue(data, x, y - 1, width, height);
      const bottom = getHeightValue(data, x, y + 1, width, height);

      const dx = (right - left) * strength;
      const dy = (bottom - top) * strength;
      const dz = 1.0;

      const normal = new THREE.Vector3(dx, dy, dz).normalize();

      const i = (y * width + x) * 4;
      output.data[i] = ((normal.x + 1) * 0.5) * 255;
      output.data[i + 1] = ((normal.y + 1) * 0.5) * 255;
      output.data[i + 2] = normal.z * 255;
      output.data[i + 3] = 255;

      if (settings.invertRed) {
        output.data[i] = 255 - output.data[i];
      }
      if (settings.invertGreen) {
        output.data[i + 1] = 255 - output.data[i + 1];
      }
    }
  }

  return applyBlur(output, settings.blur);
}

function generateDisplacementMap(
  imageData: ImageData,
  settings: TextureSettings['displacement']
): ImageData {
  const { width, height, data } = imageData;
  const output = new ImageData(width, height);
  const contrast = 1 + settings.contrast / 100;

  for (let i = 0; i < data.length; i += 4) {
    let gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
    gray = Math.min(255, Math.max(0, ((gray - 128) * contrast + 128)));
    
    if (settings.invert) {
      gray = 255 - gray;
    }

    output.data[i] = gray;
    output.data[i + 1] = gray;
    output.data[i + 2] = gray;
    output.data[i + 3] = 255;
  }

  // Always apply a minimum blur of 10px
  const minBlur = Math.max(10, settings.blur);
  return applyBlur(output, minBlur);
}

function generateSpecularMap(
  imageData: ImageData,
  settings: TextureSettings['specular']
): ImageData {
  const { width, height, data } = imageData;
  const output = new ImageData(width, height);
  const strength = settings.strength / 100;
  const falloff = settings.falloff / 50;

  for (let i = 0; i < data.length; i += 4) {
    const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
    const normalized = gray / 255;
    const value = Math.pow(normalized * strength, falloff) * 255;

    output.data[i] = value;
    output.data[i + 1] = value;
    output.data[i + 2] = value;
    output.data[i + 3] = 255;
  }

  return output;
}

function generateAOMap(imageData: ImageData, settings: TextureSettings['ao']): ImageData {
  const { width, height, data } = imageData;
  const output = new ImageData(width, height);
  const strength = settings.strength / 100;
  const samples = Math.round(settings.range * 0.5);
  const radius = settings.mean;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let occlusion = 0;
      const centerHeight = getHeightValue(data, x, y, width, height);

      for (let i = 0; i < samples; i++) {
        const angle = (i / samples) * Math.PI * 2;
        const sampleX = Math.round(x + Math.cos(angle) * radius);
        const sampleY = Math.round(y + Math.sin(angle) * radius);
        const sampleHeight = getHeightValue(data, sampleX, sampleY, width, height);

        if (sampleHeight > centerHeight) {
          occlusion += 1;
        }
      }

      let ao = 1 - (occlusion / samples) * strength;
      if (settings.invert) {
        ao = 1 - ao;
      }

      const i = (y * width + x) * 4;
      const value = ao * 255;
      output.data[i] = value;
      output.data[i + 1] = value;
      output.data[i + 2] = value;
      output.data[i + 3] = 255;
    }
  }

  return applyBlur(output, settings.blur);
}

function getHeightValue(
  data: Uint8ClampedArray,
  x: number,
  y: number,
  width: number,
  height: number
): number {
  x = Math.max(0, Math.min(x, width - 1));
  y = Math.max(0, Math.min(y, height - 1));
  const i = (y * width + x) * 4;
  return (data[i] + data[i + 1] + data[i + 2]) / 3;
}

function applyBlur(imageData: ImageData, radius: number): ImageData {
  if (radius === 0) return imageData;

  const { width, height, data } = imageData;
  const output = new ImageData(width, height);
  const abs = Math.abs(radius);
  const isSharpening = radius < 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0;
      let count = 0;

      for (let ky = -abs; ky <= abs; ky++) {
        for (let kx = -abs; kx <= abs; kx++) {
          const px = Math.min(Math.max(x + kx, 0), width - 1);
          const py = Math.min(Math.max(y + ky, 0), height - 1);
          const i = (py * width + px) * 4;

          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }
      }

      const i = (y * width + x) * 4;
      if (isSharpening) {
        const center = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const blur = (r + g + b) / (count * 3);
        const diff = center - blur;
        const factor = 2.0;

        output.data[i] = Math.min(255, Math.max(0, data[i] + diff * factor));
        output.data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + diff * factor));
        output.data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + diff * factor));
      } else {
        output.data[i] = r / count;
        output.data[i + 1] = g / count;
        output.data[i + 2] = b / count;
      }
      output.data[i + 3] = 255;
    }
  }

  return output;
}