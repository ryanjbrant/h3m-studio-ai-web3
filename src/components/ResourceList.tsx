import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { ResourceFiltersState, Resource } from '../types/resources';

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
        if (filters.tags?.length) {
          q = query(q, where('tags', 'array-contains-any', filters.tags));
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

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" /></div>;
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;
  if (!resources.length) return <div className="text-center text-gray-500 py-8">No resources found</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {resources.map(resource => (
        <div key={resource.id} className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="aspect-square bg-gray-100 relative">
            {resource.thumbnailUrl ? (
              <img src={resource.thumbnailUrl} alt={resource.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">No preview</div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-medium text-gray-900 truncate" title={resource.name}>{resource.name}</h3>
            <div className="mt-1 text-sm text-gray-500">{new Date(resource.uploadedAt).toLocaleDateString()}</div>
            <div className="mt-2 flex flex-wrap gap-1">
              {resource.tags.map(tag => (
                <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">{tag}</span>
              ))}
            </div>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-gray-500 capitalize">{resource.type}</span>
              {resource.downloadUrl && (
                <a href={resource.downloadUrl} download className="text-blue-600 hover:text-blue-800 text-sm font-medium">Download</a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 