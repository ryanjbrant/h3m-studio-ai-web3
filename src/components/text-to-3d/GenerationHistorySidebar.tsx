import { useState, useEffect } from 'react';
import { Clock, Filter, SortDesc, Search, Wand2 } from 'lucide-react';
import { GenerationData } from '../../types/admin';
import { useAuthStore } from '../../store/authStore';
import { getUserGenerations } from '../../services/admin';
import { MeshyPreviewTask } from '../../types/meshy';
import { Timestamp } from 'firebase/firestore';

interface GenerationHistorySidebarProps {
  onSelectGeneration?: (generation: GenerationData) => void;
  currentTask?: MeshyPreviewTask;
}

const ITEMS_PER_PAGE = 12;

export function GenerationHistorySidebar({ onSelectGeneration, currentTask }: GenerationHistorySidebarProps) {
  const [generations, setGenerations] = useState<GenerationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'type'>('date');
  const [filterType, setFilterType] = useState<'all' | 'text' | 'image'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastDocId, setLastDocId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    async function fetchGenerations() {
      if (!user) return;
      
      try {
        setLoading(true);
        const userGenerations = await getUserGenerations(user.uid, lastDocId);
        
        if (userGenerations.length < ITEMS_PER_PAGE) {
          setHasMore(false);
        }
        
        setGenerations(prev => lastDocId ? [...prev, ...userGenerations] : userGenerations);
        
        if (userGenerations.length > 0) {
          setLastDocId(userGenerations[userGenerations.length - 1].id);
        }
      } catch (err) {
        console.debug('Error fetching generations:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchGenerations();
  }, [user, currentPage]);

  const allGenerations = [
    ...(currentTask ? [{
      id: currentTask.id,
      userId: user?.uid || '',
      generationType: 'text' as const,
      prompt: currentTask.prompt,
      timestamp: Timestamp.fromMillis(currentTask.created_at),
      modelUrls: {
        glb: currentTask.model_urls.glb,
        usdz: currentTask.model_urls.usdz,
        fbx: currentTask.model_urls.fbx
      },
      thumbnailUrl: currentTask.thumbnail_url,
      status: currentTask.status === 'SUCCEEDED' ? 'complete' as const : 'pending' as const,
      progress: currentTask.progress,
      expiresAt: Timestamp.fromMillis(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }] : []),
    ...generations
  ];

  const filteredGenerations = allGenerations
    .filter(gen => {
      if (filterType !== 'all' && gen.generationType !== filterType) return false;
      if (searchQuery && !gen.prompt?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (b.status === 'pending' && a.status !== 'pending') return 1;
      
      if (sortBy === 'date') {
        return b.timestamp.toMillis() - a.timestamp.toMillis();
      }
      return a.generationType.localeCompare(b.generationType);
    });

  const showEmptyState = !loading && allGenerations.length === 0;
  const showNoResults = !loading && allGenerations.length > 0 && filteredGenerations.length === 0;

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-[#242429]">
        <h2 className="text-lg font-semibold mb-4">Generation History</h2>
        
        {allGenerations.length > 0 && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search generations..."
                className="w-full pl-10 pr-4 py-2 bg-[#0a0a0b] border border-[#242429] rounded-lg text-sm"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSortBy(prev => prev === 'date' ? 'type' : 'date')}
                  className="p-2 hover:bg-[#242429] rounded-md"
                  title={`Sort by ${sortBy === 'date' ? 'type' : 'date'}`}
                >
                  <SortDesc className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setFilterType(prev => {
                    const types: ('all' | 'text' | 'image')[] = ['all', 'text', 'image'];
                    const currentIndex = types.indexOf(prev);
                    return types[(currentIndex + 1) % types.length];
                  })}
                  className="p-2 hover:bg-[#242429] rounded-md"
                  title={`Filter: ${filterType}`}
                >
                  <Filter className="w-4 h-4" />
                </button>
              </div>
              <div className="text-sm text-gray-400">
                {filterType !== 'all' && `Showing ${filterType} only`}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && allGenerations.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin">
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        ) : showEmptyState ? (
          <div className="h-full flex flex-col items-center justify-center p-4 text-center text-gray-400">
            <Wand2 className="w-8 h-8 mb-2" />
            <p className="text-lg font-medium">No generations yet</p>
            <p className="text-sm">Start generating some amazing 3D models!</p>
          </div>
        ) : showNoResults ? (
          <div className="p-4 text-center text-gray-400">
            No results match your filters
          </div>
        ) : (
          <div className="space-y-2 p-2">
            {filteredGenerations.map(generation => (
              <button
                key={generation.id}
                onClick={() => onSelectGeneration?.(generation)}
                className="w-full p-3 bg-[#0a0a0b] hover:bg-[#242429] rounded-lg transition-colors text-left"
              >
                <div className="flex items-start gap-3">
                  {generation.thumbnailUrl ? (
                    <img
                      src={generation.thumbnailUrl}
                      alt="Generation preview"
                      className="w-16 h-16 object-cover rounded-lg bg-[#242429]"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-[#242429] flex items-center justify-center">
                      {generation.status === 'pending' ? (
                        <div className="animate-pulse w-8 h-8 rounded-full bg-[#363639]" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#363639]" />
                      )}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {generation.prompt || 'No prompt'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-400">
                        {generation.generationType} • {generation.status}
                      </p>
                      {generation.status === 'pending' && (
                        <div className="h-1 flex-1 bg-[#242429] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${generation.progress || 0}%` }}
                          />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(generation.timestamp.toMillis()).toLocaleString()}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {hasMore && allGenerations.length > 0 && (
        <div className="p-4 border-t border-[#242429]">
          <button
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={loading}
            className="w-full py-2 bg-[#242429] hover:bg-[#2a2a2f] rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
} 