import AWS from 'aws-sdk';

if (!import.meta.env.VITE_AWS_REGION || !import.meta.env.VITE_AWS_BUCKET_NAME) {
  throw new Error('Missing required AWS configuration environment variables');
}

AWS.config.update({
  region: import.meta.env.VITE_AWS_REGION,
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: import.meta.env.VITE_AWS_IDENTITY_POOL_ID
  })
});

export const s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  params: { Bucket: import.meta.env.VITE_AWS_BUCKET_NAME }
});

export const getSignedUrl = (key: string, operation: 'putObject' | 'getObject'): Promise<string> => {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: import.meta.env.VITE_AWS_BUCKET_NAME,
      Key: key,
      Expires: 60 * 5 // URL expires in 5 minutes
    };

    s3.getSignedUrl(operation, params, (err, url) => {
      if (err) reject(err);
      else resolve(url);
    });
  });
};