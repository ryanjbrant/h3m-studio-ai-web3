import React from 'react';
import { Trash2 } from 'lucide-react';
import { useSceneStore } from '../../store/sceneStore';

export const ObjectList: React.FC = () => {
  const { objects, selectedObjectId, setSelectedObjectId, removeObject } = useSceneStore();

  return (
    <div className="absolute top-4 right-4 w-64 bg-[#121214] border border-[#242429] rounded-lg overflow-hidden">
      <div className="p-4 border-b border-[#242429]">
        <h2 className="text-sm font-medium text-white">Scene Objects</h2>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {objects.map((object) => (
          <div
            key={object.id}
            className={`flex items-center justify-between p-4 cursor-pointer hover:bg-[#242429] ${
              selectedObjectId === object.id ? 'bg-[#242429]' : ''
            }`}
            onClick={() => setSelectedObjectId(object.id)}
          >
            <div>
              <p className="text-sm font-medium text-white">{object.name}</p>
              <p className="text-xs text-gray-400">{object.type.toUpperCase()}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeObject(object.id);
              }}
              className="p-1 hover:bg-red-500/20 rounded-lg group"
            >
              <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};