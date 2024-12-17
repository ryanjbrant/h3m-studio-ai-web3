import { useState } from 'react';
import { ResourceFiltersState } from '../types/resources';

interface ResourceFiltersProps {
  filters: ResourceFiltersState;
  onFilterChange: (filters: ResourceFiltersState) => void;
}

const RESOURCE_TYPES = [
  'all',
  'models',
  'images',
  'videos',
  'project-files',
  'code'
];

const COMMON_TAGS = [
  '3d',
  'texture',
  'animation',
  'character',
  'environment',
  'prop',
  'vehicle',
  'weapon',
  'ui',
  'effect'
];

export function ResourceFilters({ filters, onFilterChange }: ResourceFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.searchQuery || '');

  const handleTypeChange = (type: string) => {
    onFilterChange({
      ...filters,
      type: type === 'all' ? undefined : type
    });
  };

  const handleTagToggle = (tag: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    
    onFilterChange({
      ...filters,
      tags: newTags.length ? newTags : undefined
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({
      ...filters,
      searchQuery: searchInput || undefined
    });
  };

  return (
    <div className="mb-8 space-y-6">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          placeholder="Search resources..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Search
        </button>
      </form>

      {/* Type Filter */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Type</h3>
        <div className="flex flex-wrap gap-2">
          {RESOURCE_TYPES.map(type => (
            <button
              key={type}
              onClick={() => handleTypeChange(type)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
                ${type === (filters.type || 'all')
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Tags Filter */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Common Tags</h3>
        <div className="flex flex-wrap gap-2">
          {COMMON_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => handleTagToggle(tag)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
                ${(filters.tags || []).includes(tag)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 