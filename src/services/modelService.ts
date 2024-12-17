import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, deleteDoc, doc, getDocs, query, where, getDoc } from 'firebase/firestore';
import { storage, db } from '../config/firebase';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { USDZLoader } from 'three-usdz-loader';

export interface ModelMetadata {
  id?: string;
  name: string;
  modelUrl: string;
  thumbnailUrl: string;
  fileType: string;
  createdAt: Date;
  userId: string;
}

export const generateThumbnail = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(256, 256);
    
    // Set up lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(ambientLight, directionalLight);

    // Load model based on file type
    const fileType = file.name.split('.').pop()?.toLowerCase();
    let loader: GLTFLoader | FBXLoader | USDZLoader;

    switch (fileType) {
      case 'glb':
      case 'gltf':
        loader = new GLTFLoader();
        break;
      case 'fbx':
        loader = new FBXLoader();
        break;
      case 'usdz':
        loader = new USDZLoader();
        break;
      default:
        reject(new Error('Unsupported file type'));
        return;
    }

    loader.load(
      url,
      (object: { scene: THREE.Group } | THREE.Group) => {
        const model = (fileType === 'glb' || fileType === 'gltf') && 'scene' in object
          ? object.scene 
          : (object as THREE.Group);

        // Center and scale model
        const box = new THREE.Box3().setFromObject(model as THREE.Object3D);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDim;
        model.scale.multiplyScalar(scale);
        
        model.position.sub(center.multiplyScalar(scale));
        scene.add(model);

        // Position camera
        camera.position.set(2, 2, 2);
        camera.lookAt(0, 0, 0);

        // Render and get thumbnail
        renderer.render(scene, camera);
        resolve(renderer.domElement.toDataURL('image/png'));

        // Clean up
        URL.revokeObjectURL(url);
      },
      undefined,
      reject
    );
  });
};

export const uploadModel = async (
  file: File, 
  userId: string, 
  onProgress?: (progress: number) => void
): Promise<ModelMetadata> => {
  try {
    // Generate thumbnail first
    const thumbnailDataUrl = await generateThumbnail(file);
    const thumbnailBlob = await (await fetch(thumbnailDataUrl)).blob();

    // Create storage references
    const modelRef = ref(storage, `models/${userId}/${file.name}`);
    const thumbnailRef = ref(storage, `thumbnails/${userId}/${file.name}.png`);

    // Upload model file
    const modelUploadTask = uploadBytesResumable(modelRef, file);
    const modelPromise = new Promise<string>((resolve, reject) => {
      modelUploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress?.(progress);
        },
        reject,
        async () => {
          const downloadUrl = await getDownloadURL(modelUploadTask.snapshot.ref);
          resolve(downloadUrl);
        }
      );
    });

    // Upload thumbnail
    const thumbnailUploadTask = uploadBytesResumable(thumbnailRef, thumbnailBlob);
    const thumbnailPromise = new Promise<string>((resolve, reject) => {
      thumbnailUploadTask.on(
        'state_changed',
        null,
        reject,
        async () => {
          const downloadUrl = await getDownloadURL(thumbnailUploadTask.snapshot.ref);
          resolve(downloadUrl);
        }
      );
    });

    // Wait for both uploads to complete
    const [modelUrl, thumbnailUrl] = await Promise.all([modelPromise, thumbnailPromise]);

    // Save metadata to Firestore
    const metadata: ModelMetadata = {
      name: file.name,
      modelUrl,
      thumbnailUrl,
      fileType: file.name.split('.').pop()?.toLowerCase() || '',
      createdAt: new Date(),
      userId
    };

    const docRef = await addDoc(collection(db, 'models'), metadata);
    return { ...metadata, id: docRef.id };

  } catch (error) {
    console.error('Error uploading model:', error);
    throw error;
  }
};

export const getUserModels = async (userId: string): Promise<ModelMetadata[]> => {
  try {
    const q = query(collection(db, 'models'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ModelMetadata));
  } catch (error) {
    console.error('Error fetching user models:', error);
    throw error;
  }
};

export const deleteModel = async (modelId: string, userId: string): Promise<void> => {
  try {
    // Get model metadata first
    const modelDoc = doc(db, 'models', modelId);
    const modelData = await getDoc(modelDoc);
    const modelMetadata = modelData.data() as ModelMetadata;

    // Delete files from storage
    const modelRef = ref(storage, `models/${userId}/${modelMetadata.name}`);
    const thumbnailRef = ref(storage, `thumbnails/${userId}/${modelMetadata.name}.png`);
    
    await Promise.all([
      deleteDoc(modelDoc),
      deleteObject(modelRef),
      deleteObject(thumbnailRef)
    ]);
  } catch (error) {
    console.error('Error deleting model:', error);
    throw error;
  }
}; 

// Add new interface for texture URLs
export interface TextureMapUrls {
  albedo: string;
  normal: string;
  displacement: string;
  ao: string;
  specular: string;
}

// Add new function to save texture maps to storage
export const saveTextureMaps = async (
  userId: string,
  modelId: string,
  originalImage: File,
  maps: {
    normal: ImageData;
    displacement: ImageData;
    ao: ImageData;
    specular: ImageData;
  }
): Promise<TextureMapUrls> => {
  // Convert ImageData to Blob
  const imageDataToBlob = async (imageData: ImageData): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    ctx.putImageData(imageData, 0, 0);
    return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob!), 'image/png'));
  };

  try {
    // Create storage references
    const getStorageRef = (mapType: string) => 
      ref(storage, `textures/${userId}/${modelId}/${mapType}.png`);

    // Upload original image as albedo
    const albedoRef = getStorageRef('albedo');
    const albedoTask = uploadBytesResumable(albedoRef, originalImage);

    // Convert and upload other maps
    const normalBlob = await imageDataToBlob(maps.normal);
    const displacementBlob = await imageDataToBlob(maps.displacement);
    const aoBlob = await imageDataToBlob(maps.ao);
    const specularBlob = await imageDataToBlob(maps.specular);

    const normalRef = getStorageRef('normal');
    const displacementRef = getStorageRef('displacement');
    const aoRef = getStorageRef('ao');
    const specularRef = getStorageRef('specular');

    const normalTask = uploadBytesResumable(normalRef, normalBlob);
    const displacementTask = uploadBytesResumable(displacementRef, displacementBlob);
    const aoTask = uploadBytesResumable(aoRef, aoBlob);
    const specularTask = uploadBytesResumable(specularRef, specularBlob);

    // Wait for all uploads to complete
    await Promise.all([
      albedoTask,
      normalTask,
      displacementTask,
      aoTask,
      specularTask
    ]);

    // Get download URLs
    const [
      albedoUrl,
      normalUrl,
      displacementUrl,
      aoUrl,
      specularUrl
    ] = await Promise.all([
      getDownloadURL(albedoRef),
      getDownloadURL(normalRef),
      getDownloadURL(displacementRef),
      getDownloadURL(aoRef),
      getDownloadURL(specularRef)
    ]);

    return {
      albedo: albedoUrl,
      normal: normalUrl,
      displacement: displacementUrl,
      ao: aoUrl,
      specular: specularUrl
    };
  } catch (error) {
    console.error('Error saving texture maps:', error);
    throw error;
  }
};

// Add new function to apply textures to a model
export const applyTexturesToModel = (
  model: THREE.Object3D,
  textureUrls: TextureMapUrls
): void => {
  const textureLoader = new THREE.TextureLoader();
  
  // Load all textures first
  Promise.all([
    textureLoader.loadAsync(textureUrls.albedo),
    textureLoader.loadAsync(textureUrls.normal),
    textureLoader.loadAsync(textureUrls.displacement),
    textureLoader.loadAsync(textureUrls.ao)
  ]).then(([albedoMap, normalMap, displacementMap, aoMap]) => {
    // Apply textures to all meshes in the model
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Create new PBR material
        const material = new THREE.MeshStandardMaterial({
          map: albedoMap,
          normalMap: normalMap,
          displacementMap: displacementMap,
          aoMap: aoMap,
          displacementScale: 0.1, // Adjust based on your needs
          normalScale: new THREE.Vector2(1, 1),
          roughness: 0.5,
          metalness: 0.5
        });

        // Ensure UV2 exists for AO map
        if (child.geometry && !child.geometry.hasAttribute('uv2')) {
          child.geometry.setAttribute('uv2', child.geometry.getAttribute('uv'));
        }

        // Apply material
        child.material = material;
        child.material.needsUpdate = true;
      }
    });
  }).catch(error => {
    console.error('Error loading textures:', error);
  });
}; 