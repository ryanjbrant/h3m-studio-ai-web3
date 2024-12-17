import { useEffect, useState } from 'react';
import { getUserModels, deleteModel } from '../../services/modelService';
import { useAuth } from '../../hooks/useAuth';
import { TrashIcon } from '@heroicons/react/24/outline';
import type { ModelMetadata } from '../../services/modelService';

interface MyModelsSidebarProps {
  onModelSelect: (modelUrl: string) => void;
}

export function MyModelsSidebar({ onModelSelect }: MyModelsSidebarProps) {
  const [models, setModels] = useState<ModelMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const loadModels = async () => {
      if (!user) {
        setModels([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const userModels = await getUserModels(user.uid);
        setModels(userModels.sort((a, b) => {
          const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
          const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        }));
      } catch (err) {
        console.error('Error loading models:', err);
        setError('Failed to load models');
      } finally {
        setIsLoading(false);
      }
    };

    loadModels();
  }, [user]);

  const handleDeleteModel = async (modelId: string) => {
    if (!user) return;

    try {
      await deleteModel(modelId, user.uid);
      setModels(models.filter(model => model.id !== modelId));
    } catch (err) {
      console.error('Error deleting model:', err);
      setError('Failed to delete model');
    }
  };

  if (!user) {
    return (
      <div className="p-4 text-center text-gray-400">
        Please sign in to view your models
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 flex justify-center">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        {error}
      </div>
    );
  }

  if (models.length === 0) {
    return (
      <div className="p-4 text-center text-gray-400">
        No models yet. Drag and drop a model file to add one.
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 grid grid-cols-2 gap-4">
        {models.map((model) => (
          <div
            key={model.id}
            className="relative group cursor-pointer bg-[#1a1a1d] rounded-lg overflow-hidden"
            onClick={() => onModelSelect(model.modelUrl)}
          >
            <img
              src={model.thumbnailUrl}
              alt={model.name}
              className="w-full aspect-square object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (model.id) {
                    handleDeleteModel(model.id);
                  }
                }}
                className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                aria-label="Delete model"
              >
                <TrashIcon className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-black/75 p-2">
              <p className="text-white text-sm truncate">{model.name}</p>
              <p className="text-gray-400 text-xs">
                {new Date(model.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 