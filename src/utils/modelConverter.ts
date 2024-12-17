const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const convertUsdzToGlb = async (usdzFile: File): Promise<File> => {
  try {
    // Create form data for file upload
    const formData = new FormData();
    formData.append('file', usdzFile);

    // Send file to conversion service
    const response = await fetch(`${API_URL}/api/convert/usdz-to-glb`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Conversion failed');
    }

    // Get the converted GLB file
    const glbBlob = await response.blob();
    return new File(
      [glbBlob], 
      usdzFile.name.replace('.usdz', '.glb'),
      { type: 'model/gltf-binary' }
    );
  } catch (error) {
    console.error('Error converting USDZ to GLB:', error);
    throw error;
  }
}; 