import { useState, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';

export function useModelLoader(url: string | undefined) {
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!url) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    async function loadModel() {
      try {
        const response = await fetch(url, {
          mode: 'cors',
          credentials: 'omit',
          headers: {
            'Accept': 'application/json, model/gltf+json, model/gltf-binary',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to load model: ${response.statusText}`);
        }

        if (isMounted) {
          await useGLTF.preload(url);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to load model'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadModel();

    return () => {
      isMounted = false;
      if (url) {
        useGLTF.clear(url);
      }
    };
  }, [url]);

  return { error, isLoading };
}