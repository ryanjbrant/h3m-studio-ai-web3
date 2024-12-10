import { create } from 'zustand';
import { SceneObjectType } from '../types/scene';

interface SceneState {
  objects: SceneObjectType[];
  selectedObjectId: string | null;
  addObject: (object: SceneObjectType) => void;
  updateObject: (id: string, updates: Partial<SceneObjectType>) => void;
  removeObject: (id: string) => void;
  setSelectedObjectId: (id: string | null) => void;
}

export const useSceneStore = create<SceneState>((set) => ({
  objects: [],
  selectedObjectId: null,
  addObject: (object) => set((state) => ({ 
    objects: [...state.objects, object] 
  })),
  updateObject: (id, updates) => set((state) => ({
    objects: state.objects.map((obj) =>
      obj.id === id ? { ...obj, ...updates } : obj
    ),
  })),
  removeObject: (id) => set((state) => ({
    objects: state.objects.filter((obj) => obj.id !== id),
    selectedObjectId: state.selectedObjectId === id ? null : state.selectedObjectId,
  })),
  setSelectedObjectId: (id) => set({ selectedObjectId: id }),
}));