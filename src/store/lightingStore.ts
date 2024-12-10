import { create } from 'zustand';
import { Vector3 } from 'three';

export type LightType = 'ambient' | 'directional' | 'point' | 'spot';

export interface Light {
  id: string;
  type: LightType;
  intensity: number;
  position?: [number, number, number];
  target?: [number, number, number];
  color: string;
}

interface LightingState {
  lights: Light[];
  addLight: (type: LightType) => void;
  removeLight: (id: string) => void;
  updateLight: (id: string, updates: Partial<Light>) => void;
}

const defaultLightProps: Record<LightType, Partial<Light>> = {
  ambient: {
    intensity: 0.5,
    color: '#ffffff'
  },
  directional: {
    intensity: 1,
    position: [5, 5, 5],
    target: [0, 0, 0],
    color: '#ffffff'
  },
  point: {
    intensity: 1,
    position: [0, 3, 0],
    color: '#ffffff'
  },
  spot: {
    intensity: 1,
    position: [3, 3, 3],
    target: [0, 0, 0],
    color: '#ffffff'
  }
};

export const useLightingStore = create<LightingState>((set) => ({
  lights: [],
  addLight: (type) => set((state) => ({
    lights: [...state.lights, {
      id: crypto.randomUUID(),
      type,
      ...defaultLightProps[type]
    } as Light]
  })),
  removeLight: (id) => set((state) => ({
    lights: state.lights.filter(light => light.id !== id)
  })),
  updateLight: (id, updates) => set((state) => ({
    lights: state.lights.map(light => 
      light.id === id ? { ...light, ...updates } : light
    )
  }))
}));