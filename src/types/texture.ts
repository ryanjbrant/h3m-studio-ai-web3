export interface NormalMapSettings {
  strength: number;
  blur: number;
  invertRed: boolean;
  invertGreen: boolean;
}

export interface DisplacementMapSettings {
  contrast: number;
  blur: number;
  invert: boolean;
}

export interface SpecularMapSettings {
  strength: number;
  falloff: number;
}

export interface AOMapSettings {
  strength: number;
  range: number;
  mean: number;
  blur: number;
  invert: boolean;
}

export interface TextureSettings {
  normal: NormalMapSettings;
  displacement: DisplacementMapSettings;
  specular: SpecularMapSettings;
  ao: AOMapSettings;
}

export interface GeneratedMaps {
  normal: ImageData | null;
  displacement: ImageData | null;
  ao: ImageData | null;
  specular: ImageData | null;
} 