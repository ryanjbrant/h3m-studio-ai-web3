import { SceneObjectData } from './SceneBuilder';
import { TransformMode } from './types';

interface SceneControlsProps {
  selectedObject: SceneObjectData | undefined;
  onObjectUpdate: (id: string, updates: Partial<SceneObjectData>) => void;
  transformMode: TransformMode;
  onTransformModeChange: (mode: TransformMode) => void;
  lightIntensity: number;
  onLightIntensityChange: (intensity: number) => void;
}

export function SceneControls(_props: SceneControlsProps) {
  return null; // Remove all controls as they're now in the toolbar
} 