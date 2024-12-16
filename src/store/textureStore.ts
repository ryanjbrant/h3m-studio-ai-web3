import { create } from 'zustand';
import { TextureSettings } from '@/types/texture';

interface TextureState {
  settings: TextureSettings;
  setSettings: (settings: Partial<TextureSettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: TextureSettings = {
  normal: {
    strength: 50,
    blur: 0,
    invertRed: false,
    invertGreen: false
  },
  displacement: {
    contrast: 50,
    blur: 10,
    invert: false
  },
  specular: {
    strength: 50,
    falloff: 25
  },
  ao: {
    strength: 50,
    range: 16,
    mean: 8,
    blur: 0,
    invert: false
  }
};

export const useTextureStore = create<TextureState>((set) => ({
  settings: defaultSettings,
  setSettings: (newSettings) =>
    set((state) => ({
      settings: {
        ...state.settings,
        ...newSettings
      }
    })),
  resetSettings: () => set({ settings: defaultSettings })
}));