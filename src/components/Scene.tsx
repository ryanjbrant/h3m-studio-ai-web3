import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Grid } from '@react-three/drei';
import * as THREE from 'three';
import { useTextureStore } from '../store/textureStore';

interface SceneProps {
  maps: Record<string, ImageData>;
  sourceImage?: HTMLImageElement;
}

export const Scene: React.FC<SceneProps> = ({ maps, sourceImage }) => {
  const sphereRef = useRef<THREE.Mesh>(null);
  const { previewSettings } = useTextureStore();

  // Convert ImageData to DataTexture
  const createDataTexture = (imageData: ImageData) => {
    const texture = new THREE.DataTexture(
      imageData.data,
      imageData.width,
      imageData.height,
      THREE.RGBAFormat
    );
    texture.needsUpdate = true;
    texture.flipY = true; // Ensure correct orientation
    return texture;
  };

  // Create color texture from source image
  const createColorTexture = (image: HTMLImageElement) => {
    const texture = new THREE.Texture(image);
    texture.needsUpdate = true;
    texture.flipY = true;
    return texture;
  };

  // Create textures
  const normalMap = previewSettings.maps.normal ? createDataTexture(maps.normal) : null;
  const displacementMap = previewSettings.maps.displacement ? createDataTexture(maps.displacement) : null;
  const aoMap = previewSettings.maps.ao ? createDataTexture(maps.ao) : null;
  const roughnessMap = previewSettings.maps.specular ? createDataTexture(maps.specular) : null;
  const colorMap = sourceImage ? createColorTexture(sourceImage) : null;

  useFrame((state, delta) => {
    if (sphereRef.current && previewSettings.rotation) {
      sphereRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <>
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
      <directionalLight position={[-5, 5, -5]} intensity={0.5} />
      <ambientLight intensity={0.4} />

      <Grid
        position={[0, -2, 0]}
        args={[10, 10]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#404040"
        sectionSize={2}
        sectionThickness={1}
        sectionColor="#202020"
        fadeDistance={30}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={true}
      />

      <mesh ref={sphereRef} castShadow receiveShadow>
        <sphereGeometry 
          args={[1, 2048, 2048]} 
          onUpdate={(geometry) => {
            // Ensure uv2 for AO mapping
            if (geometry.attributes.uv) {
              geometry.setAttribute(
                'uv2',
                new THREE.Float32BufferAttribute(
                  geometry.attributes.uv.array,
                  2
                )
              );
            }
          }}
        />
        <meshStandardMaterial
          map={colorMap}
          normalMap={normalMap}
          normalScale={normalMap ? new THREE.Vector2(0.1, 0.1) : new THREE.Vector2(1, 1)}
          displacementMap={displacementMap}
          displacementScale={displacementMap ? 0.05 : 0}
          aoMap={aoMap}
          aoMapIntensity={aoMap ? 0.3 : 1}
          roughnessMap={roughnessMap}
          metalness={0.01}
          roughness={1}
          envMapIntensity={1}
        />
      </mesh>
    </>
  );
};