import { s3, getSignedUrl } from '../config/aws';
import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Firebase Storage operations
export const uploadTextureToFirebase = async (file: File, userId: string) => {
  try {
    const textureRef = ref(storage, `textures/${userId}/${file.name}`);
    const snapshot = await uploadBytes(textureRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    throw error;
  }
};

export const deleteTextureFromFirebase = async (textureUrl: string) => {
  try {
    const textureRef = ref(storage, textureUrl);
    await deleteObject(textureRef);
  } catch (error) {
    throw error;
  }
};

// AWS S3 operations
export const uploadTextureToS3 = async (file: File, userId: string) => {
  try {
    const key = `textures/${userId}/${file.name}`;
    const signedUrl = await getSignedUrl(key, 'putObject');
    
    await fetch(signedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    return `https://h3mstudio-web.s3.us-west-1.amazonaws.com/${key}`;
  } catch (error) {
    throw error;
  }
};

export const deleteTextureFromS3 = async (key: string) => {
  try {
    await s3.deleteObject({
      Bucket: 'h3mstudio-web',
      Key: key
    }).promise();
  } catch (error) {
    throw error;
  }
};