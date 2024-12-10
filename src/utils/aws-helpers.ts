import { s3 } from '../config/aws';

export const validateAwsConfig = () => {
  const requiredEnvVars = [
    'VITE_AWS_REGION',
    'VITE_AWS_BUCKET_NAME',
    'VITE_AWS_IDENTITY_POOL_ID'
  ];

  const missingVars = requiredEnvVars.filter(
    varName => !import.meta.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required AWS environment variables: ${missingVars.join(', ')}`
    );
  }
};

export const checkBucketAccess = async () => {
  try {
    await s3.headBucket({
      Bucket: import.meta.env.VITE_AWS_BUCKET_NAME
    }).promise();
    return true;
  } catch (error) {
    console.error('Error accessing S3 bucket:', error);
    return false;
  }
};