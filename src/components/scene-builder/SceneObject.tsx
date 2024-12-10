import React, { useRef, useEffect, useState } from 'react';
import { TransformControls } from '@react-three/drei';
import { Object3D, Group, Mesh, Material } from 'three';
import { useSceneStore } from '../../store/sceneStore';
import { SceneObjectType } from '../../types/scene';
import { loadModel } from '../../utils/modelLoader';

interface SceneObjectProps {
  object: SceneObjectType;
  transformMode: 'translate' | 'rotate' | 'scale' | null;
}

export const SceneObject: React.FC<SceneObjectProps> = ({ object, transformMode }) => {
  const groupRef = useRef<Group>(null);
  const [model, setModel] = useState<Object3D | null>(null);
  const [error, setError] = useState<string | null>(null);
  const updateObject = useSceneStore((state) => state.updateObject);
  const setSelectedObjectId = useSceneStore((state) => state.setSelectedObjectId);

  useEffect(() => {
    let mounted = true;
    let objectUrl: string | null = null;

    const loadModelData = async () => {
      try {
        const loadedModel = await loadModel(object.url);
        if (mounted) {
          setModel(loadedModel);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          console.error('Failed to load model:', err);
          setError(err instanceof Error ? err.message : 'Failed to load model');
        }
      }
    };

    loadModelData();

    return () => {
      mounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      if (model) {
        model.traverse((child) => {
          if (child instanceof Mesh) {
            if (child.geometry) {
              child.geometry.dispose();
            }
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((material: Material) => material.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });
      }
    };
  }, [object.url]);

  const handleTransform = () => {
    if (groupRef.current) {
      const { position, rotation, scale } = groupRef.current;
      updateObject(object.id, {
        position: [position.x, position.y, position.z],
        rotation: [rotation.x, rotation.y, rotation.z],
        scale: [scale.x, scale.y, scale.z],
      });
    }
  };

  if (error) {
    return null;
  }

  return (
    <group
      ref={groupRef}
      position={object.position}
      rotation={object.rotation}
      scale={object.scale}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedObjectId(object.id);
      }}
    >
      {transformMode && (
        <TransformControls
          mode={transformMode}
          object={groupRef}
          onObjectChange={handleTransform}
        />
      )}
      {model && <primitive object={model} />}
    </group>
  );
};