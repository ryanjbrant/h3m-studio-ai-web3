import { useState, useEffect } from 'react';
import { getGenerations, deleteGeneration } from '../../services/admin';
import { GenerationData } from '../../types/admin';
import { Timestamp } from 'firebase/firestore';
import { Eye, Trash2, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function GenerationsPanel() {
  const [generations, setGenerations] = useState<GenerationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastTimestamp, setLastTimestamp] = useState<Timestamp>();
  const [filters, setFilters] = useState({
    type: '' as '' | 'text' | 'image',
    status: '' as '' | 'pending' | 'complete' | 'failed'
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadGenerations();
  }, [filters]);

  const loadGenerations = async (loadMore = false) => {
    try {
      setLoading(true);
      const timestamp = loadMore ? lastTimestamp : undefined;
      const data = await getGenerations(
        timestamp,
        {
          type: filters.type || undefined,
          status: filters.status || undefined
        }
      );
      
      if (loadMore) {
        setGenerations(prev => [...prev, ...data]);
      } else {
        setGenerations(data);
      }
      
      if (data.length > 0) {
        setLastTimestamp(data[data.length - 1].timestamp);
      }
    } catch (error) {
      console.error('Error loading generations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this generation?')) {
      try {
        await deleteGeneration(id);
        setGenerations(prev => prev.filter(gen => gen.id !== id));
      } catch (error) {
        console.error('Error deleting generation:', error);
      }
    }
  };

  const handleViewInScene = (generation: GenerationData) => {
    localStorage.setItem('sceneBuilderModel', JSON.stringify({
      modelUrl: generation.modelUrls.glb,
      timestamp: Date.now()
    }));
    navigate('/scene-builder');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">User Generations</h2>
        <div className="flex gap-4">
          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as typeof filters.type }))}
            className="px-3 py-2 bg-[#0a0a0b] border border-[#242429] rounded-md text-white"
          >
            <option value="">All Types</option>
            <option value="text">Text to 3D</option>
            <option value="image">Image to 3D</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as typeof filters.status }))}
            className="px-3 py-2 bg-[#0a0a0b] border border-[#242429] rounded-md text-white"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="complete">Complete</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {generations.map(generation => (
          <div
            key={generation.id}
            className="bg-[#121214] border border-[#242429] rounded-lg p-4 flex items-center gap-4"
          >
            {generation.thumbnailUrl && (
              <img
                src={generation.thumbnailUrl}
                alt="Generation preview"
                className="w-16 h-16 object-cover rounded-lg"
              />
            )}
            
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{generation.prompt || 'No prompt'}</p>
                  <p className="text-sm text-gray-400">
                    {generation.generationType} • {generation.status} • 
                    {new Date(generation.timestamp.toMillis()).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  {generation.status === 'complete' && (
                    <button
                      onClick={() => handleViewInScene(generation)}
                      className="p-2 hover:bg-[#242429] rounded-lg transition-colors"
                      title="View in Scene Builder"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => window.open(generation.modelUrls.glb)}
                    className="p-2 hover:bg-[#242429] rounded-lg transition-colors"
                    title="View Model"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(generation.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                    title="Delete Generation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {generations.length > 0 && (
        <button
          onClick={() => loadGenerations(true)}
          disabled={loading}
          className="w-full py-2 px-4 bg-[#242429] text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2a2a2f] transition-colors"
        >
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
} 