export type TexturePreset = 'metal' | 'wood' | 'fabric' | 'stone';
export type FilterType = 'sobel' | 'scharr';

export interface NormalMapSettings {
  strength: number;
  blur: number;
  sharp: number;
  detailLevel: number;
  filterType: FilterType;
  invertRed: boolean;
  invertGreen: boolean;
  height: number;
}

export interface DisplacementMapSettings {
  contrast: number;
  blur: number;
  sharp: number;
  invert: boolean;
}

export interface AmbientOcclusionSettings {
  strength: number;
  mean: number;
  range: number;
  blur: number;
  sharp: number;
  invert: boolean;
}

export interface SpecularMapSettings {
  strength: number;
  mean: number;
  range: number;
  falloff: number;
}

export interface TextureSettings {
  normal: NormalMapSettings;
  displacement: DisplacementMapSettings;
  ao: AmbientOcclusionSettings;
  specular: SpecularMapSettings;
  preset: TexturePreset | null;
}

export interface PreviewSettings {
  model: 'sphere' | 'cube' | 'plane' | 'custom';
  rotation: boolean;
  maps: {
    diffuse: boolean;
    displacement: boolean;
    normal: boolean;
    ao: boolean;
    specular: boolean;
  };
  environment: boolean;
}