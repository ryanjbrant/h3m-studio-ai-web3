import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { Resource } from '../types/resources';
import { generatePlaceholderResources } from '../data/resourcesData';

const Resources: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEngine, setSelectedEngine] = useState<string | null>(null);
  const [resources] = useState<Resource[]>(() => generatePlaceholderResources(80));
  const [showFilters, setShowFilters] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const engines = ['Unity', 'Unreal', 'WebGL', 'Cinema', 'Blender'];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredResources = resources.filter(resource => {
    const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 0);
    
    if (searchTerms.length === 0 && !selectedEngine) return true;

    const searchableContent = [
      resource.title,
      resource.description,
      resource.engine,
      resource.category,
      `${resource.likes} likes`
    ].map(content => content.toLowerCase());

    const matchesSearch = searchTerms.length === 0 || searchTerms.every(term =>
      searchableContent.some(content => content.includes(term))
    );

    const matchesEngine = !selectedEngine || resource.engine === selectedEngine;

    return matchesSearch && matchesEngine;
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="min-h-[calc(100vh-44px)] bg-[#0a0a0b]">
      {/* Search and Filters */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="sticky top-0 z-10 bg-[#0a0a0b] border-b border-[#242429] py-1.5"
      >
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-2">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full h-8 pl-9 pr-4 bg-[#121214] border border-[#242429] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="h-8 px-3 flex items-center gap-2 bg-[#121214] border border-[#242429] rounded-md text-white hover:bg-[#242429] transition-colors text-sm"
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-1 w-48 py-1 bg-[#121214] border border-[#242429] rounded-md shadow-lg"
                >
                  {engines.map((engine) => (
                    <button
                      key={engine}
                      onClick={() => {
                        setSelectedEngine(selectedEngine === engine ? null : engine);
                        setShowFilters(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                        selectedEngine === engine
                          ? 'bg-blue-500/10 text-blue-500'
                          : 'text-white hover:bg-[#242429]'
                      }`}
                    >
                      {engine}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Resource Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div 
          ref={containerRef}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px]"
        >
          {filteredResources.map((resource, index) => (
            <motion.div
              key={resource.id}
              layoutId={resource.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ 
                y: -8, 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              className={`relative rounded-xl overflow-hidden cursor-pointer bg-[#121214] ${
                resource.size === '2x2' ? 'col-span-2 row-span-2' :
                resource.size === '2x1' ? 'col-span-2' :
                resource.size === '1x2' ? 'row-span-2' : ''
              }`}
            >
              <div className="absolute inset-0">
                <img 
                  src={resource.imageUrl} 
                  alt={resource.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80" />
              </div>

              <div className="absolute inset-0 p-4 flex flex-col justify-end">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-[#242429] rounded-full text-xs text-white">
                      {resource.engine}
                    </span>
                    <span className="px-2 py-1 bg-[#242429] rounded-full text-xs text-white">
                      {resource.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white leading-tight">{resource.title}</h3>
                  <p className="text-sm text-gray-300 line-clamp-2">{resource.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>{resource.likes} likes</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Resources;