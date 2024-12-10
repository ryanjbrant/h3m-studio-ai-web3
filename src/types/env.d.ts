/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AWS_REGION: string
  readonly VITE_AWS_BUCKET_NAME: string
  readonly VITE_AWS_IDENTITY_POOL_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}