import React, { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { Download, Box } from 'lucide-react';
import { Resource } from '../../types/resources';
import { PreviewModal } from '../admin/PreviewModal';
import JSZip from 'jszip';

interface ResourceCardProps {
  resource: Resource;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
  isActive: boolean;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  isSelected,
  onSelect,
  index,
  isActive
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewFiles, setPreviewFiles] = useState<{
    file: File;
    sceneFiles?: {
      gltf: File;
      bin?: File;
      textures: File[];
    };
  }>();
  
  // Mouse tracking values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Smooth spring physics for rotation
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), {
    stiffness: 150,
    damping: 30
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), {
    stiffness: 150,
    damping: 30
  });

  useEffect(() => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    const updateMousePosition = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Normalize mouse position between -0.5 and 0.5
      mouseX.set((e.clientX - centerX) / rect.width);
      mouseY.set((e.clientY - centerY) / rect.height);
    };

    card.addEventListener('mousemove', updateMousePosition);
    card.addEventListener('mouseleave', () => {
      mouseX.set(0);
      mouseY.set(0);
    });

    return () => {
      card.removeEventListener('mousemove', updateMousePosition);
      card.removeEventListener('mouseleave', () => {
        mouseX.set(0);
        mouseY.set(0);
      });
    };
  }, [mouseX, mouseY]);

  const variants = {
    unselected: (i: number) => ({
      opacity: 0,
      scale: 0.8,
      y: 100,
      transition: {
        duration: 0.4,
        delay: i * 0.05,
        ease: [0.4, 0, 0.2, 1]
      }
    }),
    selected: {
      scale: 1.5,
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    normal: {
      opacity: 1,
      scale: 1,
      y: 0
    }
  };

  const loadFiles = async () => {
    if (!resource.model) return;
    
    try {
      // Download and process zip file for GLTF
      if (resource.model.modelType === 'gltf') {
        const zipResponse = await fetch(resource.model.modelUrl);
        const zipBlob = await zipResponse.blob();
        const zip = await JSZip.loadAsync(zipBlob);
        
        // Find main GLTF file
        const gltfFile = Object.values(zip.files).find(f => f.name.endsWith('.gltf'));
        if (!gltfFile) throw new Error('No GLTF file found in zip');
        
        // Find bin file
        const binFile = Object.values(zip.files).find(f => f.name.endsWith('.bin'));
        
        // Find texture files
        const textureFiles = Object.values(zip.files).filter(f => 
          f.name.match(/\.(jpg|jpeg|png|webp)$/i)
        );

        // Convert files to File objects
        const gltfContent = await gltfFile.async('blob');
        const gltfFileObj = new File([gltfContent], gltfFile.name, { type: 'model/gltf+json' });

        let binFileObj: File | undefined;
        if (binFile) {
          const binContent = await binFile.async('blob');
          binFileObj = new File([binContent], binFile.name, { type: 'application/octet-stream' });
        }

        const textureFileObjs = await Promise.all(
          textureFiles.map(async (file) => {
            const content = await file.async('blob');
            return new File([content], file.name, { type: 'image/*' });
          })
        );

        setPreviewFiles({
          file: gltfFileObj,
          sceneFiles: {
            gltf: gltfFileObj,
            bin: binFileObj,
            textures: textureFileObjs
          }
        });
      } else {
        // Handle GLB/USDZ directly
        const response = await fetch(resource.model.modelUrl);
        const blob = await response.blob();
        setPreviewFiles({
          file: new File([blob], `model.${resource.model.modelType}`)
        });
      }
    } catch (error) {
      console.error('Error loading model files:', error);
    }
  };

  const handlePreview = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await loadFiles();
    setShowPreview(true);
  };

  const handlePreviewClose = () => {
    setShowPreview(false);
  };

  const handleSnapshotTaken = (snapshot: string) => {
    // Update resource thumbnail if needed
    if (resource.model) {
      // TODO: Implement thumbnail update logic
      console.log('New thumbnail:', snapshot);
    }
  };

  return (
    <>
      <motion.div
        ref={cardRef}
        layoutId={`card-${resource.id}`}
        style={{
          rotateX: isActive ? rotateX : 0,
          rotateY: isActive ? rotateY : 0,
          transformStyle: 'preserve-3d'
        }}
        variants={variants}
        custom={index}
        animate={isSelected ? 'selected' : isActive ? 'normal' : 'unselected'}
        whileHover={{ scale: isSelected ? 1.5 : 1.05 }}
        onClick={onSelect}
        className={`
          relative rounded-xl overflow-hidden cursor-pointer bg-[#121214]
          ${resource.size === '2x2' ? 'col-span-2 row-span-2' :
            resource.size === '2x1' ? 'col-span-2' :
            resource.size === '1x2' ? 'row-span-2' : ''}
        `}
      >
        <motion.div
          className="absolute inset-0"
          style={{ perspective: 1000 }}
        >
          <img 
            src={resource.imageUrl} 
            alt={resource.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80" />
        </motion.div>

        {resource.model && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePreview}
            className="absolute top-4 right-4 p-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors"
          >
            <Box className="w-5 h-5" />
          </motion.button>
        )}

        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ delay: 0.3 }}
              className="absolute right-0 top-0 bottom-0 w-96 bg-[#121214] border-l border-[#242429] p-6"
            >
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">{resource.title}</h2>
                <p className="text-gray-400">{resource.description}</p>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-[#242429] rounded-full text-sm">
                    {resource.engine}
                  </span>
                  <span className="px-3 py-1 bg-[#242429] rounded-full text-sm">
                    {resource.category}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
                >
                  <Download className="w-4 h-4" />
                  Download
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {showPreview && previewFiles && (
        <PreviewModal
          file={previewFiles.file}
          sceneFiles={previewFiles.sceneFiles}
          onClose={handlePreviewClose}
          onSnapshotTaken={handleSnapshotTaken}
        />
      )}
    </>
  );
};