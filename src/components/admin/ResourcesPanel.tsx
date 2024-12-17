import React, { useState, useCallback, useEffect } from 'react';
import { FileText, Search, Filter, Upload, Download, Trash2, Eye } from 'lucide-react';
import { Switch } from '@headlessui/react';
import { useDropzone } from 'react-dropzone';
import JSZip from 'jszip';
import { uploadResource, getResources, deleteResource, Resource } from '../../services/resourceService';
import { PreviewModal } from './PreviewModal';
import { ModelPreview } from './ModelPreview';
import { convertUsdzToGlb } from '../../utils/modelConverter';

interface ResourceFormData {
  file: File | null;
  originalFile?: File;
  description: string;
  tags: string[];
  isFree: boolean;
  price: string;
  previewImage?: string;
  sceneFiles?: {
    gltf: File;
    bin?: File;
    textures: File[];
  };
}

export interface ResourcesPanelProps {}

export const ResourcesPanel: React.FC<ResourcesPanelProps> = () => {
  const [formData, setFormData] = useState<ResourceFormData>({
    file: null,
    description: '',
    tags: [],
    isFree: false,
    price: '0.00'
  });

  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('models');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const data = await getResources();
      setResources(data);
    } catch (error) {
      console.error('Failed to fetch resources:', error);
    }
  };

  const processZipFile = async (file: File) => {
    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(file);
      
      // Find the GLTF file
      const gltfFile = Object.values(contents.files).find(f => 
        !f.dir && f.name.toLowerCase().endsWith('.gltf')
      );
      
      if (!gltfFile) {
        throw new Error('No GLTF file found in the zip');
      }

      // Read GLTF content to find referenced files
      const gltfContent = await gltfFile.async('text');
      const gltfData = JSON.parse(gltfContent);
      const referencedFiles = new Set<string>();

      // Extract referenced texture files from GLTF
      if (gltfData.images) {
        gltfData.images.forEach((image: { uri?: string }) => {
          if (image.uri) {
            const fileName = image.uri.split('/').pop();
            if (fileName) referencedFiles.add(fileName);
          }
        });
      }

      // Find the bin file
      const binFile = Object.values(contents.files).find(f => 
        !f.dir && f.name.toLowerCase().endsWith('.bin')
      );

      if (binFile) {
        referencedFiles.add(binFile.name);
      }

      // Find texture files
      const textureFiles = Object.values(contents.files).filter(f => 
        !f.dir && (
          f.name.toLowerCase().endsWith('.png') ||
          f.name.toLowerCase().endsWith('.jpg') ||
          f.name.toLowerCase().endsWith('.jpeg')
        )
      );

      // Convert zip entries to Files
      const gltfBlob = await gltfFile.async('blob');
      const gltfActualFile = new File([gltfBlob], gltfFile.name, { type: 'model/gltf+json' });

      let binActualFile: File | undefined;
      if (binFile) {
        const binBlob = await binFile.async('blob');
        binActualFile = new File([binBlob], binFile.name, { type: 'application/octet-stream' });
      }

      // Process texture files and maintain their original paths
      const textureActualFiles = await Promise.all(
        textureFiles.map(async (tf) => {
          const blob = await tf.async('blob');
          const fileName = tf.name.split('/').pop() || tf.name;
          return new File([blob], fileName, { type: `image/${fileName.split('.').pop()}` });
        })
      );

      // Verify all referenced files are present
      const missingFiles = Array.from(referencedFiles).filter(fileName => {
        const isTexture = textureActualFiles.some(f => f.name === fileName);
        const isBin = binActualFile && binActualFile.name === fileName;
        return !isTexture && !isBin;
      });

      if (missingFiles.length > 0) {
        throw new Error(`Missing referenced files: ${missingFiles.join(', ')}`);
      }

      setFormData(prev => ({
        ...prev,
        file: file,
        sceneFiles: {
          gltf: gltfActualFile,
          bin: binActualFile,
          textures: textureActualFiles
        }
      }));

      setShowPreviewModal(true);
    } catch (error) {
      console.error('Error processing zip file:', error);
      alert(error instanceof Error ? error.message : 'Error processing zip file. Please make sure it contains a valid GLTF scene.');
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    
    const processFile = async () => {
      try {
        if (fileName.endsWith('.zip')) {
          await processZipFile(file);
        } else if (fileName.endsWith('.usdz')) {
          // Convert USDZ to GLB
          const glbFile = await convertUsdzToGlb(file);
          setFormData(prev => ({ 
            ...prev, 
            file: glbFile,
            originalFile: file // Store original USDZ for upload
          }));
          setShowPreviewModal(true);
        } else if (fileName.endsWith('.glb')) {
          setFormData(prev => ({ ...prev, file }));
          setShowPreviewModal(true);
        } else {
          alert('Please upload a ZIP file containing a GLTF scene, GLB file, or USDZ file');
        }
      } catch (error) {
        console.error('Error processing file:', error);
        alert('Error processing file. Please try again.');
      }
    };

    processFile();
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'model/gltf-binary': ['.glb'],
      'application/zip': ['.zip'],
      'model/vnd.usdz+zip': ['.usdz']
    },
    maxFiles: 1
  });

  const handleSnapshotTaken = (snapshot: string) => {
    setFormData(prev => ({ ...prev, previewImage: snapshot }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file) {
      alert('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    try {
      let previewBlob: Blob | null = null;
      if (formData.previewImage) {
        const response = await fetch(formData.previewImage);
        previewBlob = await response.blob();
      }

      // Determine which file to use for storage
      const isZipFile = formData.file.name.toLowerCase().endsWith('.zip');
      const isUsdz = formData.originalFile?.name.toLowerCase().endsWith('.usdz');
      
      await uploadResource(
        isZipFile ? formData.sceneFiles!.gltf : formData.file,
        {
          description: formData.description,
          tags: formData.tags,
          isFree: formData.isFree,
          price: formData.price,
          previewBlob,
          zipFile: isZipFile ? formData.file : undefined,
          originalFile: isUsdz ? formData.originalFile : undefined
        }
      );

      // Refresh resources list
      await fetchResources();

      // Reset form
      setFormData({
        file: null,
        description: '',
        tags: [],
        isFree: false,
        price: '0.00'
      });
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload resource');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (resource: Resource) => {
    if (!window.confirm(`Are you sure you want to delete ${resource.fileName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteResource(resource);
      setResources(resources.filter(r => r.id !== resource.id));
    } catch (error) {
      console.error('Failed to delete resource:', error);
      alert('Failed to delete resource');
    }
  };

  const handleDownload = async (resource: Resource) => {
    try {
      const response = await fetch(resource.fileUrl);
      const blob = await response.blob();
      
      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = resource.fileName;
      
      // Programmatically click the link to trigger download
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Failed to download resource:', error);
      alert('Failed to download resource');
    }
  };

  const handleCardClick = (resource: Resource) => {
    if (resource.fileName.toLowerCase().endsWith('.glb') || 
        resource.fileName.toLowerCase().endsWith('.gltf') ||
        resource.fileName.toLowerCase().endsWith('.usdz')) {
      setSelectedResource(resource);
    }
  };

  return (
    <div className="bg-[#121214] border border-[#242429] rounded-lg p-6">
      {showPreviewModal && formData.file && (
        <PreviewModal
          file={formData.file}
          sceneFiles={formData.sceneFiles}
          onClose={() => setShowPreviewModal(false)}
          onSnapshotTaken={handleSnapshotTaken}
        />
      )}

      {/* Resource Viewer Modal */}
      {selectedResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative bg-[#0a0a0b] rounded-lg w-[90vw] h-[80vh] max-w-6xl">
            <button 
              onClick={() => setSelectedResource(null)}
              className="absolute top-4 right-4 p-2 hover:bg-[#242429] rounded-lg transition-colors z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="absolute top-4 left-4 z-10">
              <h3 className="text-lg font-medium">{selectedResource.fileName}</h3>
              <p className="text-sm text-gray-400">{selectedResource.description}</p>
            </div>
            <ModelPreview
              modelUrl={selectedResource.fileUrl}
              previewUrl={selectedResource.previewUrl}
              className="w-full h-full"
              generatePreview={false}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Resources
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search resources..."
              className="pl-9 pr-4 py-1.5 bg-[#0a0a0b] border border-[#242429] rounded-lg text-sm"
            />
            <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <button className="p-1.5 hover:bg-[#242429] rounded-lg transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Left Column - Resource Grid */}
        <div className="w-2/3">
          <div className="grid grid-cols-2 gap-4">
            {resources.map((resource) => (
              <div 
                key={resource.id} 
                className="bg-[#0a0a0b] border border-[#242429] rounded-lg p-4 group cursor-pointer"
                onClick={() => handleCardClick(resource)}
              >
                <div className="aspect-video bg-[#242429] rounded-lg mb-4 flex items-center justify-center overflow-hidden relative">
                  {(resource.fileName.toLowerCase().endsWith('.glb') || 
                    resource.fileName.toLowerCase().endsWith('.gltf') ||
                    resource.fileName.toLowerCase().endsWith('.usdz')) ? (
                    <>
                      {resource.previewUrl ? (
                        <img 
                          src={resource.previewUrl} 
                          alt={resource.fileName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FileText className="w-8 h-8 text-gray-600" />
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye className="w-8 h-8 text-white" />
                      </div>
                    </>
                  ) : (
                    <FileText className="w-8 h-8 text-gray-600" />
                  )}
                </div>
                <h3 className="font-medium mb-1">{resource.fileName}</h3>
                <p className="text-sm text-gray-400 mb-2">{resource.description}</p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {resource.tags.map((tag, index) => (
                    <span key={index} className="text-xs bg-[#242429] px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(resource);
                      }}
                      className="p-1.5 hover:bg-[#242429] rounded-lg transition-colors" 
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(resource);
                      }}
                      className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors" 
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">
                      {resource.isFree ? 'Free' : `$${parseFloat(resource.price).toFixed(2)}`}
                    </span>
                    <span className="text-sm text-gray-400">
                      {(resource.fileSize / (1024 * 1024)).toFixed(1)} MB
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Upload Form */}
        <div className="w-1/3">
          <div className="bg-[#0a0a0b] border border-[#242429] rounded-lg p-4">
            <h3 className="font-medium mb-4">Upload New Resource</h3>
            
            {/* Resource Type Tabs */}
            <div className="flex gap-2 border-b border-[#242429] mb-4">
              <button
                onClick={() => setActiveTab('models')}
                className={`px-4 py-2 -mb-px border-b-2 ${
                  activeTab === 'models'
                    ? 'border-blue-500 text-blue-500'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Models
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`px-4 py-2 -mb-px border-b-2 ${
                  activeTab === 'code'
                    ? 'border-blue-500 text-blue-500'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Code
              </button>
              <button
                onClick={() => setActiveTab('projects')}
                className={`px-4 py-2 -mb-px border-b-2 ${
                  activeTab === 'projects'
                    ? 'border-blue-500 text-blue-500'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Projects
              </button>
            </div>

            {/* Models Tab Content */}
            {activeTab === 'models' && (
              <form onSubmit={handleSubmit}>
                {/* Dropzone or Preview */}
                {formData.previewImage ? (
                  <div className="relative mb-4">
                    <img 
                      src={formData.previewImage} 
                      alt="Preview" 
                      className="w-full aspect-video object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPreviewModal(true)}
                      className="absolute bottom-2 right-2 px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Change Preview
                    </button>
                  </div>
                ) : (
                  <div {...getRootProps()} className="border-2 border-dashed border-[#242429] rounded-lg p-6 mb-4 text-center cursor-pointer hover:border-blue-500 transition-colors">
                    <input {...getInputProps()} />
                    <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-400">
                      {isDragActive ? 'Drop file here' : 'Drop ZIP (GLTF scene) or GLB file here or click to upload'}
                    </p>
                  </div>
                )}

                {/* Description Field */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#121214] border border-[#242429] rounded-lg text-sm"
                    rows={3}
                    placeholder="Enter resource description..."
                  />
                </div>

                {/* Tags Field */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Tags</label>
                  <input
                    type="text"
                    value={formData.tags.join(', ')}
                    onChange={(e) => {
                      const tagsArray = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
                      setFormData(prev => ({ ...prev, tags: tagsArray }));
                    }}
                    className="w-full px-3 py-2 bg-[#121214] border border-[#242429] rounded-lg text-sm"
                    placeholder="Enter tags separated by commas..."
                  />
                </div>

                {/* Free/Paid Toggle */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium">Mark as Free</span>
                  <Switch
                    checked={formData.isFree}
                    onChange={(checked) => setFormData(prev => ({ ...prev, isFree: checked }))}
                    className={`${
                      formData.isFree ? 'bg-blue-500' : 'bg-[#242429]'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                  >
                    <span
                      className={`${
                        formData.isFree ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </div>

                {/* Pricing Controls (visible only when not free) */}
                {!formData.isFree && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Price (USD)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                        className="w-full pl-8 pr-3 py-2 bg-[#121214] border border-[#242429] rounded-lg text-sm"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isUploading || !formData.file}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? 'Uploading...' : 'Upload Resource'}
                </button>
              </form>
            )}

            {/* Code Tab Content */}
            {activeTab === 'code' && (
              <div className="flex items-center justify-center h-64 border-2 border-dashed border-[#242429] rounded-lg">
                <p className="text-gray-400">Code upload coming soon</p>
              </div>
            )}

            {/* Projects Tab Content */}
            {activeTab === 'projects' && (
              <div className="flex items-center justify-center h-64 border-2 border-dashed border-[#242429] rounded-lg">
                <p className="text-gray-400">Projects upload coming soon</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 