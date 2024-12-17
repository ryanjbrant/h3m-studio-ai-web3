import { collection, addDoc, getDocs, query, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage, auth } from '../config/firebase';

const checkAdminAccess = async () => {
  const currentUser = auth.currentUser;
  console.log('Current user:', currentUser?.email);
  
  if (!currentUser) {
    throw new Error('User must be authenticated');
  }

  // Get user's role from Firestore
  const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
  console.log('User doc exists:', userDoc.exists());
  
  if (!userDoc.exists()) {
    throw new Error('User not found');
  }

  const userData = userDoc.data();
  console.log('User role:', userData.role);
  
  if (userData.role !== 'admin') {
    throw new Error('Only admin users can access resources');
  }

  return currentUser;
};

export interface Resource {
  id: string;
  fileName: string;
  fileUrl: string;
  previewUrl?: string;
  fileSize: number;
  description: string;
  tags: string[];
  isFree: boolean;
  price: string;
  createdAt: Date;
  isGltfZip: boolean;
  isUsdz: boolean;
}

interface ResourceUploadOptions {
  description: string;
  tags: string[];
  isFree: boolean;
  price: string;
  previewBlob?: Blob | null;
  zipFile?: File;
  originalFile?: File;
}

export const uploadResource = async (file: File, options: ResourceUploadOptions) => {
  try {
    await checkAdminAccess();
    
    // Upload the original file (GLB, ZIP, or USDZ)
    const fileRef = ref(storage, `resources/${Date.now()}_${options.originalFile?.name || file.name}`);
    await uploadBytes(fileRef, options.originalFile || options.zipFile || file);
    const fileUrl = await getDownloadURL(fileRef);

    // Upload preview image if provided
    let previewUrl: string | undefined;
    if (options.previewBlob) {
      const previewRef = ref(storage, `previews/${Date.now()}_${file.name.replace(/\.(glb|zip|usdz)$/, '.png')}`);
      await uploadBytes(previewRef, options.previewBlob);
      previewUrl = await getDownloadURL(previewRef);
    }

    // Save resource metadata to Firestore
    const resourceData: Omit<Resource, 'id'> = {
      fileName: options.originalFile?.name || file.name,
      fileUrl,
      previewUrl,
      fileSize: (options.originalFile || options.zipFile || file).size,
      description: options.description,
      tags: options.tags,
      isFree: options.isFree,
      price: options.price,
      createdAt: new Date(),
      isGltfZip: file.name.toLowerCase().endsWith('.zip'),
      isUsdz: options.originalFile?.name.toLowerCase().endsWith('.usdz') || false
    };

    const docRef = await addDoc(collection(db, 'resources'), resourceData);
    return { id: docRef.id, ...resourceData };
  } catch (error) {
    console.error('Error uploading resource:', error);
    throw error;
  }
};

export const getResources = async (): Promise<Resource[]> => {
  try {
    await checkAdminAccess();
    const q = query(collection(db, 'resources'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Resource));
  } catch (error) {
    console.error('Error fetching resources:', error);
    throw error;
  }
};

export const deleteResource = async (resource: Resource) => {
  try {
    await checkAdminAccess();

    // Delete the file from storage
    const fileRef = ref(storage, resource.fileUrl);
    await deleteObject(fileRef);

    // Delete the preview image if it exists
    if (resource.previewUrl) {
      const previewRef = ref(storage, resource.previewUrl);
      await deleteObject(previewRef);
    }

    // Delete the document from Firestore
    await deleteDoc(doc(db, 'resources', resource.id));

  } catch (error) {
    console.error('Error deleting resource:', error);
    throw error;
  }
}; 