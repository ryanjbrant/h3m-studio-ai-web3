import React, { useRef } from 'react';
import { useHelper } from '@react-three/drei';
import { DirectionalLightHelper, PointLightHelper, SpotLightHelper } from 'three';
import { Light } from '../../store/lightingStore';

interface SceneLightProps {
  light: Light;
}

export const SceneLight: React.FC<SceneLightProps> = ({ light }) => {
  const lightRef = useRef<any>(null);

  // Add helpers for each light type
  useHelper(
    light.type !== 'ambient' ? lightRef : null,
    light.type === 'directional' ? DirectionalLightHelper :
    light.type === 'point' ? PointLightHelper :
    light.type === 'spot' ? SpotLightHelper : null,
    1,
    light.color
  );

  switch (light.type) {
    case 'ambient':
      return (
        <ambientLight
          ref={lightRef}
          intensity={light.intensity}
          color={light.color}
        />
      );
    case 'directional':
      return (
        <directionalLight
          ref={lightRef}
          intensity={light.intensity}
          position={light.position}
          color={light.color}
          castShadow
        />
      );
    case 'point':
      return (
        <pointLight
          ref={lightRef}
          intensity={light.intensity}
          position={light.position}
          color={light.color}
          castShadow
        />
      );
    case 'spot':
      return (
        <spotLight
          ref={lightRef}
          intensity={light.intensity}
          position={light.position}
          target-position={light.target}
          color={light.color}
          castShadow
          angle={Math.PI / 6}
          penumbra={1}
        />
      );
    default:
      return null;
  }
};