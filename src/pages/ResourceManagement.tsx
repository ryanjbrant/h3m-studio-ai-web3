import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { useAuth } from '../hooks/useAuth';
import { ResourceList } from '../components/admin/ResourceList';
import { ResourceFilters } from '../components/admin/ResourceFilters';
import { ResourceFiltersState } from '../types/resources';
import { FileText, Upload, AlertCircle } from 'lucide-react';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

export function ResourceManagement() {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [filters, setFilters] = useState<ResourceFiltersState>({});
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const getFileType = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    
    // Map file extensions to types
    const typeMap: { [key: string]: { type: string, subType: string } } = {
      // 3D Models
      'glb': { type: 'models', subType: 'glb' },
      'gltf': { type: 'models', subType: 'gltf' },
      'fbx': { type: 'models', subType: 'fbx' },
      'obj': { type: 'models', subType: 'obj' },
      'usdz': { type: 'models', subType: 'usdz' },
      
      // Project Files
      'c4d': { type: 'projects', subType: 'c4d' },
      'blend': { type: 'projects', subType: 'blend' },
      'unity': { type: 'projects', subType: 'unity' },
      'unreal': { type: 'projects', subType: 'unreal' },
      
      // Images
      'jpg': { type: 'images', subType: 'image' },
      'jpeg': { type: 'images', subType: 'image' },
      'png': { type: 'images', subType: 'image' },
      'gif': { type: 'images', subType: 'image' },
      'webp': { type: 'images', subType: 'image' },
      
      // Videos
      'mp4': { type: 'videos', subType: 'video' },
      'mov': { type: 'videos', subType: 'video' },
      'webm': { type: 'videos', subType: 'video' },
      
      // Code
      'glsl': { type: 'code', subType: 'shader' },
      'hlsl': { type: 'code', subType: 'shader' },
      'shader': { type: 'code', subType: 'shader' }
    };

    return typeMap[extension] || { type: 'other', subType: 'unknown' };
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!user) return;
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const storage = getStorage();
      const db = getFirestore();
      
      const uploadPromises = acceptedFiles.map(async (file) => {
        const { type, subType } = getFileType(file);
        const timestamp = Date.now();
        const filePath = `resources/${type}/${subType}/${user.uid}/${timestamp}_${file.name}`;
        const storageRef = ref(storage, filePath);
        
        const uploadTask = uploadBytesResumable(storageRef, file);
        
        return new Promise((resolve, reject) => {
          uploadTask.on('state_changed', 
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
            },
            (error) => {
              console.error('Upload error:', error);
              setError('Failed to upload file. Please try again.');
              reject(error);
            },
            async () => {
              try {
                // Get download URL
                const downloadUrl = await uploadTask.snapshot.ref.getDownloadURL();
                
                // Create resource document in Firestore
                await addDoc(collection(db, 'resources'), {
                  name: file.name,
                  type,
                  subType,
                  size: file.size,
                  uploadedBy: user.uid,
                  uploadedAt: new Date(),
                  path: filePath,
                  bucket: storageRef.bucket,
                  tags: [],
                  extension: file.name.split('.').pop()?.toLowerCase(),
                  downloadUrl,
                  isPublic: false,
                  downloads: 0,
                  version: '1.0.0'
                });
                
                resolve(true);
              } catch (error) {
                console.error('Error creating resource document:', error);
                reject(error);
              }
            }
          );
        });
      });

      await Promise.all(uploadPromises);
      setUploadProgress(100);
      // Trigger resource list refresh
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error uploading files:', error);
      setError('An error occurred during upload. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [user]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      // 3D Models
      'model/gltf-binary': ['.glb'],
      'model/gltf+json': ['.gltf'],
      'model/fbx': ['.fbx'],
      'model/obj': ['.obj'],
      'model/usdz': ['.usdz'],
      
      // Project Files
      'application/octet-stream': ['.c4d', '.blend', '.unity', '.unreal'],
      
      // Images
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      
      // Videos
      'video/*': ['.mp4', '.mov', '.webm'],
      
      // Code Files
      'text/plain': ['.glsl', '.hlsl', '.shader'],
      
      // Archives
      'application/zip': ['.zip']
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Resource Management</h1>
        </div>
      </div>

      {/* Upload Area */}
      <div className="bg-[#121214] border border-[#242429] rounded-lg">
        <div
          {...getRootProps()}
          className={`p-8 text-center cursor-pointer transition-colors relative ${
            isDragActive ? 'bg-blue-500/5 border-blue-500/50' : 'hover:bg-[#1a1a1f]'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className={`w-8 h-8 mx-auto mb-3 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
          {isDragActive ? (
            <p className="text-blue-500 font-medium">Drop files here...</p>
          ) : (
            <div>
              <p className="font-medium mb-1">Drag and drop files here, or click to select</p>
              <p className="text-sm text-gray-400">
                Supports 3D models, project files, images, videos, and shader code
              </p>
            </div>
          )}
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="p-4 border-t border-[#242429]">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 bg-[#242429] rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="text-sm text-gray-400 w-12">
                {uploadProgress.toFixed(0)}%
              </span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 border-t border-[#242429] bg-red-500/5">
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <ResourceFilters
        filters={filters}
        onFilterChange={setFilters}
      />

      {/* Resource List */}
      <div className="bg-[#121214] border border-[#242429] rounded-lg">
        <ResourceList filters={filters} key={refreshTrigger} />
      </div>
    </div>
  );
} 