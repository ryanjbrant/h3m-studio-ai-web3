import { create } from 'zustand';
import { TextureSettings, PreviewSettings } from '../types';

interface TextureState {
  settings: TextureSettings;
  previewSettings: PreviewSettings;
  updateSettings: <K extends keyof TextureSettings>(
    mapType: K,
    settings: Partial<TextureSettings[K]>
  ) => void;
  updatePreviewSettings: (settings: Partial<PreviewSettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: TextureSettings = {
  normal: {
    strength: 100,
    blur: 0,
    sharp: 0,
    detailLevel: 5,
    filterType: 'sobel',
    invertRed: false,
    invertGreen: false,
    height: 50,
  },
  displacement: {
    contrast: 0,
    blur: 0.2,
    sharp: 0,
    invert: false,
  },
  ao: {
    strength: 100,
    mean: 50,
    range: 50,
    blur: 0,
    sharp: 0,
    invert: false,
  },
  specular: {
    strength: 100,
    mean: 50,
    range: 50,
    falloff: 50,
  },
  preset: null,
};

const defaultPreviewSettings: PreviewSettings = {
  model: 'sphere',
  rotation: true,
  maps: {
    diffuse: true,
    displacement: true,
    normal: true,
    ao: true,
    specular: true,
  },
  environment: false,
};

export const useTextureStore = create<TextureState>((set) => ({
  settings: defaultSettings,
  previewSettings: defaultPreviewSettings,
  updateSettings: (mapType, newSettings) =>
    set((state) => ({
      settings: {
        ...state.settings,
        [mapType]: { ...state.settings[mapType], ...newSettings },
      },
    })),
  updatePreviewSettings: (newSettings) =>
    set((state) => ({
      previewSettings: { ...state.previewSettings, ...newSettings },
    })),
  resetSettings: () =>
    set({ settings: defaultSettings, previewSettings: defaultPreviewSettings }),
}));