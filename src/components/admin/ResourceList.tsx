import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { ResourceFiltersState, Resource } from '../../types/resources';
import { Download, Eye, Edit, Trash2 } from 'lucide-react';

interface ResourceListProps {
  filters: ResourceFiltersState;
}

export function ResourceList({ filters }: ResourceListProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      setError(null);

      try {
        const db = getFirestore();
        let q = query(collection(db, 'resources'), orderBy('uploadedAt', 'desc'));

        if (filters.type) {
          q = query(q, where('type', '==', filters.type));
        }
        if (filters.subType) {
          q = query(q, where('subType', '==', filters.subType));
        }
        if (filters.tags?.length) {
          q = query(q, where('tags', 'array-contains-any', filters.tags));
        }
        if (filters.isPublic !== undefined) {
          q = query(q, where('isPublic', '==', filters.isPublic));
        }

        const querySnapshot = await getDocs(q);
        const fetchedResources = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          uploadedAt: doc.data().uploadedAt?.toDate()
        })) as Resource[];

        const filteredResources = filters.searchQuery
          ? fetchedResources.filter(resource =>
              resource.name.toLowerCase().includes(filters.searchQuery!.toLowerCase()) ||
              resource.tags.some(tag => tag.toLowerCase().includes(filters.searchQuery!.toLowerCase()))
            )
          : fetchedResources;

        setResources(filteredResources);
      } catch (err) {
        console.error('Error fetching resources:', err);
        setError('Failed to load resources');
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [filters]);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
    </div>
  );

  if (error) return (
    <div className="text-center text-red-500 py-8">
      {error}
    </div>
  );

  if (!resources.length) return (
    <div className="text-center text-gray-500 py-8">
      No resources found
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
      {resources.map((resource, index) => (
        <motion.div
          key={resource.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="group relative bg-[#121214] rounded-xl overflow-hidden"
        >
          {/* Preview */}
          <div className="aspect-square bg-[#0a0a0b] relative">
            {resource.thumbnailUrl ? (
              <img
                src={resource.thumbnailUrl}
                alt={resource.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-600">
                No preview
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {/* Hover Actions */}
            <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors">
                <Eye className="w-4 h-4" />
              </button>
              <button className="p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors">
                <Edit className="w-4 h-4" />
              </button>
              <button className="p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="p-4">
            <div className="flex flex-wrap gap-1 mb-2">
              <span className="px-2 py-1 bg-[#242429] rounded-full text-xs">
                {resource.type}
              </span>
              <span className="px-2 py-1 bg-[#242429] rounded-full text-xs">
                {resource.subType}
              </span>
            </div>
            
            <h3 className="font-medium text-white truncate mb-1" title={resource.name}>
              {resource.name}
            </h3>
            
            <div className="flex flex-wrap gap-1 mb-3">
              {resource.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 bg-blue-500/10 text-blue-500 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
              {resource.tags.length > 3 && (
                <span className="px-1.5 py-0.5 bg-[#242429] rounded text-xs">
                  +{resource.tags.length - 3}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>{new Date(resource.uploadedAt).toLocaleDateString()}</span>
              {resource.downloadUrl && (
                <a
                  href={resource.downloadUrl}
                  download
                  className="flex items-center gap-1 text-blue-500 hover:text-blue-400"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
} 