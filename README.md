# H3M Studio AI Web3

## TODO List
- [ ] Fix TypeScript linter errors in frontend components
- [ ] Review and consolidate converter implementations:
  - `converter/src/convert.py` (Docker/Cloud Run version)
  - `functions/converter/convert.py` (Firebase Functions version)
  - Ensure proper integration between Firebase Functions and Cloud Run service
- [ ] Set up proper environment variables for deployment
- [ ] Complete Docker container configuration for USDZ conversion
- [ ] Test end-to-end conversion flow
- [ ] Add proper error handling and logging
- [ ] Document deployment process
- [ ] Directory Structure Reorganization:
  - Current nested server directories need simplification
  - Proposed structure:
    ```
    h3m-studio-ai-web3/
    ├── server/              # Main server directory
    │   ├── proxy/          # Proxy server code
    │   ├── converter/      # USD conversion service
    │   └── venv/          # Python virtual environment
    ```
  - Steps needed:
    1. Document all current dependencies and paths
    2. Update Docker configurations
    3. Update npm/node scripts
    4. Update import/require paths
    5. Update Python import paths
    6. Update configuration files
    7. Update build processes
    8. Update service discovery
    9. Test thoroughly in new branch
    10. Create migration guide

## GLTF Resource Handling

### Uploading GLTF Models
1. Zip the GLTF model with all its dependencies (textures, bin files)
2. Drag and drop the ZIP file into the upload area
3. System extracts and validates:
   - GLTF file
   - Binary (.bin) files
   - Texture files (png, jpg)
4. Preview modal shows 3D model with textures before upload
5. Take snapshot for thumbnail
6. Upload confirmed files to storage

### File Structure Requirements
- ZIP file must contain:
  - Main .gltf file
  - All referenced texture files
  - Binary (.bin) files if used
- Texture paths in GLTF must match filenames
- All referenced files must be present

## GLTF Resource Preview System

### Resource Card Preview Implementation
The system handles both direct model files (GLB/USDZ) and GLTF models with textures:

1. **Preview Button**
   - Each resource card displays a 3D preview button when `resource.model` exists
   - Clicking triggers the preview modal with proper model loading

2. **GLTF Loading Process**
   ```typescript
   // When preview button is clicked:
   const loadFiles = async () => {
     // 1. Download and extract zip
     const zipResponse = await fetch(resource.model.modelUrl);
     const zip = await JSZip.loadAsync(await zipResponse.blob());
     
     // 2. Find required files
     const gltfFile = Object.values(zip.files).find(f => f.name.endsWith('.gltf'));
     const binFile = Object.values(zip.files).find(f => f.name.endsWith('.bin'));
     const textureFiles = Object.values(zip.files).filter(f => 
       f.name.match(/\.(jpg|jpeg|png|webp)$/i)
     );
     
     // 3. Convert to File objects
     const gltfFileObj = new File([await gltfFile.async('blob')], gltfFile.name);
     const binFileObj = binFile ? 
       new File([await binFile.async('blob')], binFile.name) : undefined;
     const textureFileObjs = await Promise.all(
       textureFiles.map(async (file) => 
         new File([await file.async('blob')], file.name)
       )
     );
   }
   ```

3. **File Handling**
   - GLTF files are extracted from zip with all dependencies
   - Bin files are handled for binary data
   - Texture files are automatically detected and loaded
   - All files are converted to proper File objects with correct MIME types

4. **Preview Modal Integration**
   ```typescript
   <PreviewModal
     file={gltfFileObj}
     sceneFiles={{
       gltf: gltfFileObj,
       bin: binFileObj,
       textures: textureFileObjs
     }}
     onClose={handleClose}
     onSnapshotTaken={handleSnapshot}
   />
   ```

5. **Texture Mapping**
   - PreviewModal automatically maps textures using file names
   - Texture paths in GLTF file are matched to extracted textures
   - Supports all common texture formats (jpg, png, webp)

### Key Features
- Automatic zip extraction
- Proper MIME type handling
- Texture path resolution
- Memory cleanup of blob URLs
- Support for both GLTF and GLB/USDZ
- Snapshot capability for thumbnails

### Usage Example
```typescript
// Resource object structure
const resource = {
  model: {
    modelUrl: 'path/to/model.zip', // For GLTF with textures
    modelType: 'gltf',
    // ... other resource properties
  }
};

// Preview will automatically:
1. Download and extract the zip
2. Load GLTF with textures
3. Display in 3D viewer
4. Enable snapshot capture
```

### Best Practices
1. Always provide models in zip format for GLTF
2. Include all referenced textures
3. Maintain correct file paths in GLTF
4. Use proper file extensions
5. Clean up resources after preview closes

## System Architecture

### Frontend Stack
- React with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- React Three Fiber for 3D rendering
- Framer Motion for animations

### Authentication & Authorization
- Firebase Authentication for user management
- Custom admin role system
- Protected routes using HOCs (`withAuth` and `withAdminAuth`)
- Email/password and Google sign-in support

### Firebase Integration
- **Authentication**: User management and role-based access control
- **Firestore**: 
  - User profiles and metadata
  - Generation history
  - Admin statistics
- **Storage**: 
  - 3D model storage
  - Thumbnail storage
  - Organized in `/models/{userId}/{generationId}/` structure

### Meshy AI Integration
- **API Endpoints**:
  - Text-to-3D generation
  - Image-to-3D conversion
  - Progress tracking
- **Model Formats**:
  - GLB for web display
  - Support for MTL/OBJ for advanced use cases
- **Proxy Server**:
  - Handles CORS issues
  - Streams large model files
  - Manages API rate limiting

## Key Features

### Text-to-3D Generation
1. User inputs text description
2. System generates multiple variations
3. Preview tiles show generation progress
4. Models are saved to Firebase Storage
5. Generation history is tracked in Firestore

### Admin Dashboard
- **Overview**: Analytics and key metrics
- **User Management**: 
  - Role assignment (admin/user)
  - User activity tracking
  - Account status management
- **Content Management**: 
  - Model moderation
  - Resource management
- **Generation History**:
  - Track all user generations
  - Monitor system usage

### Security Implementation
```typescript
// Firebase Storage Rules
match /models/{userId}/{generationId}/{file} {
  allow read: if isAuthenticated();
  allow write: if isAuthenticated() && isOwner(userId);
}

// Firestore Rules
match /users/{userId} {
  allow read: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
  allow write: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
}
```

## Critical Components

### Model Generation Flow
1. User initiates generation
2. Frontend creates placeholder in history
3. Backend processes through Meshy
4. Progress updates via polling
5. Model download and storage on completion

### Admin Access Control
1. User signs in
2. System checks Firestore for admin role
3. Admin routes protected by `withAdminAuth` HOC
4. Sidebar navigation based on permissions

### Storage Organization
```
/models
  /{userId}
    /{generationId}
      - model.glb
      - thumbnail.jpg
/thumbnails
  /{userId}
    /{generationId}
      - preview.jpg
```

## Development Guidelines

### Environment Setup
1. Firebase configuration in `src/config/firebase.ts`
2. Meshy API keys in environment variables
3. CORS configuration for development
4. Python virtual environment setup:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r converter/requirements.txt
   ```

### Adding New Features
1. Implement component logic
2. Add Firebase security rules
3. Update admin dashboard if needed
4. Test with different user roles

### Common Issues & Solutions
1. **CORS Issues**: Use proxy server for external APIs
2. **Large File Handling**: Stream responses for models
3. **Auth State**: Use `useAdmin` hook for role checks
4. **Route Protection**: Always wrap with appropriate HOC

## Cloud Run Deployment Guide

### Prerequisites
1. Google Cloud CLI installed and initialized
2. Docker installed and running
3. Access to the Google Cloud project (`h3m-studio-b17e2`)
4. Firebase project initialized

### Build and Deploy Steps
```bash
# 1. Build the Docker image locally
docker build -t usdz-converter ./converter

# 2. Tag the image for Google Container Registry
docker tag usdz-converter gcr.io/h3m-studio-b17e2/usdz-converter

# 3. Push to Google Container Registry
docker push gcr.io/h3m-studio-b17e2/usdz-converter

# 4. Deploy to Cloud Run
gcloud run deploy usdz-converter \
  --image gcr.io/h3m-studio-b17e2/usdz-converter \
  --platform managed \
  --region us-central1 \
  --memory 2Gi \
  --cpu 2 \
  --port 8080 \
  --allow-unauthenticated
```

### Environment Variables
```bash
# Required environment variables for the service
GOOGLE_CLOUD_PROJECT=h3m-studio-b17e2
FIREBASE_STORAGE_BUCKET=h3m-studio-b17e2.appspot.com
```

### Service Configuration
1. **Resources**:
   - Memory: 2GB minimum
   - CPU: 2 vCPUs recommended
   - Concurrency: 80 (default)

2. **Networking**:
   - Port: 8080
   - HTTPS enabled by default
   - Custom domain optional

3. **Security**:
   - Service account needs these roles:
     - `roles/storage.objectViewer`
     - `roles/storage.objectCreator`
   - HTTPS enforced
   - Authentication optional based on requirements

### Monitoring & Maintenance
1. **Health Checks**:
   - Endpoint: `/`
   - HTTP GET request
   - Expected response: 200 OK

2. **Logging**:
   - View logs in Google Cloud Console
   - Monitor for errors and performance
   - Set up alerts for critical issues

3. **Scaling**:
   - Auto-scales based on traffic
   - Min instances: 0
   - Max instances: Set based on budget
   - Concurrent requests per instance: 80

### Troubleshooting
1. **Common Issues**:
   - Memory limits: Increase if OOM errors occur
   - Cold starts: Use min instances > 0 if needed
   - Timeout errors: Adjust timeout in gunicorn config

2. **Debugging**:
   - Check container logs in Cloud Console
   - Verify environment variables
   - Test service account permissions
   - Monitor resource usage

### Cost Optimization
1. **Best Practices**:
   - Use minimum required resources
   - Allow scaling to zero when idle
   - Monitor and adjust resource allocation
   - Set budget alerts

2. **Estimated Costs**:
   - Based on vCPU, memory, and request volume
   - Only pay for actual usage
   - Includes free tier benefits

## Deployment Checklist
- [ ] Update Firebase security rules
- [ ] Configure CORS settings
- [ ] Set environment variables
- [ ] Update API endpoints
- [ ] Test admin functionality
- [ ] Verify file upload limits

## API Integration Notes

### Meshy API Calls
```typescript
// Generation endpoint
POST /api/text-to-3d
{
  prompt: string,
  style: string,
  format: "glb" | "obj"
}

// Progress checking
GET /api/progress/{taskId}

// Model download
GET /api/download/{modelId}
```

### Firebase Methods
```typescript
// Admin check
const isAdmin = async (userId) => {
  const doc = await getDoc(doc(db, 'users', userId));
  return doc.data()?.role === 'admin';
};

// Generation tracking
const saveGeneration = async (userId, data) => {
  await setDoc(doc(db, 'generations', generationId), {
    userId,
    prompt,
    status,
    createdAt: serverTimestamp()
  });
};
```

## Maintenance Notes
- Regular backup of Firestore data
- Monitor storage usage
- Check API rate limits
- Update security rules as needed
- Test admin functions periodically

Remember to update this documentation when making significant changes to the system architecture or workflow.

## Critical API Integration Details

### Text to 3D Implementation Requirements
1. **API Configuration**
   - Base URL: `https://api.meshy.ai`
   - Text to 3D endpoint: `/v2/text-to-3d`
   - Required headers:
     ```typescript
     {
       'Authorization': `Bearer ${API_KEY}`,
       'Content-Type': 'application/json',
       'Accept': 'application/json'
     }
     ```

2. **Required Request Parameters**
   ```typescript
   {
     mode: 'preview',  // Required - must be lowercase
     prompt: string,   // Required - object description
     art_style: string, // Optional - e.g., 'realistic'
     format: 'glb',    // Required for web compatibility
   }
   ```

3. **Proxy Server Requirements**
   - Local development endpoint: `/api/text-to-3d`
   - Task status endpoint: `/api/task/:taskId`
   - Required routes:
     ```typescript
     // Text to 3D generation
     POST /api/text-to-3d
     // Task status checking
     GET /api/task/:taskId
     ```

4. **Implementation Files**
   - Core API service: `src/services/meshyApi.ts`
   - Proxy server: `server/proxy.ts`
   - Main component: `src/components/text-to-3d/TextTo3D.tsx`
   - Generation controls: `src/components/text-to-3d/GenerationControls.tsx`
   - History sidebar: `src/components/text-to-3d/GenerationHistorySidebar.tsx`

5. **Generation Flow**
   1. Client sends request to local proxy (`/api/text-to-3d`)
   2. Proxy forwards to Meshy API (`/v2/text-to-3d`)
   3. Client polls task status via `/api/task/:taskId`
   4. On completion, model is displayed and saved to history

6. **Required Environment Variables**
   ```env
   VITE_MESHY_API_KEY=your_api_key_here
   ```

### Meshy API Important Notes
- Base URL: `https://api.meshy.ai`
- Different endpoints use different versions:
  - Text to 3D: v2
  - Image to 3D: v1
  - Text to Texture: v1
  - Text to Voxel: v1
- Authentication: Bearer token in headers
- Rate limits: 20 requests per second (default)

### Proxy Server Critical Points
```typescript
// ALWAYS use proxy for model/texture downloads to avoid CORS
const MODEL_PROXY = 'http://localhost:8080/model';
const TEXTURE_PROXY = 'http://localhost:8080/texture';

// Correct way to fetch models through proxy
const fetchModel = async (url: string) => {
  const proxyUrl = `${MODEL_PROXY}?url=${encodeURIComponent(url)}`;
  // Proxy handles streaming for large files
  const response = await fetch(proxyUrl);
  return response;
};

// Correct way to fetch textures/MTL files
const fetchTexture = async (url: string) => {
  const proxyUrl = `${TEXTURE_PROXY}?url=${encodeURIComponent(url)}`;
  const response = await fetch(proxyUrl);
  return response;
};
```

### Key API Endpoints & Usage
```typescript
// 1. Text to 3D Generation (V2)
POST /v2/text-to-3d
{
  "prompt": string,
  "style": "realistic" | "stylized",
  "format": "glb", // ALWAYS use GLB for web
  "webhook_url": string // Optional
}

// 2. Progress Checking
GET /v2/tasks/{taskId}
// Poll every 2-3 seconds
// Stop polling when status is 'completed' or 'failed'

// 3. Model Download
// ALWAYS use proxy server to avoid CORS
const downloadUrl = `${MODEL_PROXY}?url=${encodeURIComponent(meshyUrl)}`;
```

### CORS Issues Prevention
1. **Proxy Server Setup**
```typescript
// server/proxy.ts
app.use(cors({
  origin: ['http://localhost:5173', 'https://your-production-domain.com'],
  methods: ['GET', 'POST'],
  credentials: true
}));

// Handle streaming for large files
app.get('/model', async (req, res) => {
  const { url } = req.query;
  const response = await fetch(url as string);
  response.body.pipe(res);
});
```

2. **Firebase Storage CORS**
```json
// cors.json
[{
  "origin": ["*"],
  "method": ["GET", "POST", "PUT", "DELETE"],
  "maxAgeSeconds": 3600
}]

// Apply with:
gsutil cors set cors.json gs://your-bucket-name
```

### Common Pitfalls & Solutions
1. **Model Loading Issues**
   - ALWAYS use proxy for model/texture URLs
   - Handle both GLB and OBJ/MTL formats
   - Stream large files through proxy

2. **Generation Progress**
   - Create placeholder immediately
   - Show loading state in UI
   - Handle failed generations gracefully

3. **Storage Organization**
   ```typescript
   // Correct storage path structure
   const modelPath = `models/${userId}/${generationId}/model.glb`;
   const thumbnailPath = `thumbnails/${userId}/${generationId}/preview.jpg`;
   ```

4. **Error Handling**
   ```typescript
   try {
     const response = await fetch(proxyUrl);
     if (!response.ok) {
       // Check specific error types
       if (response.status === 404) {
         throw new Error('Model not found');
       }
       throw new Error('Failed to load model');
     }
     // Handle response
   } catch (error) {
     console.error('Model loading error:', error);
     // Show user-friendly error message
   }
   ```

### API Response Handling
```typescript
// Generation Response
interface MeshyResponse {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: {
    model_url: string;
    thumbnail_url: string;
  };
  error?: string;
}

// Progress Response
interface ProgressResponse {
  status: string;
  progress: number;
  message?: string;
}
```

### Best Practices
1. **Rate Limiting**
   - Implement exponential backoff for retries
   - Cache successful responses
   - Monitor API usage

2. **Error Recovery**
   - Save generation metadata in Firestore
   - Implement retry mechanism for failed downloads
   - Keep track of generation history

3. **Performance**
   - Use GLB format for web display
   - Implement progressive loading
   - Cache downloaded models

4. **Security**
   - Never expose API keys in frontend
   - Validate all user inputs
   - Implement proper access controls

## Critical Implementation Notes

### Model Loading - CRITICAL!! IMPORTANT
When loading models in any component (ModelViewer, SceneBuilder, etc.), ALWAYS use direct Firebase Storage URLs with useGLTF:
```typescript
// CORRECT WAY - Use Firebase Storage URL directly
const { scene } = useGLTF(modelUrl);

// INCORRECT - Do not use proxy for model loading
// const proxyUrl = `${API_URL}/api/model?url=${encodeURIComponent(modelUrl)}`;
// const { scene } = useGLTF(proxyUrl);
```

This is critical for:
- Model Viewer
- Scene Builder
- 4-Up View
- Any component using Three.js/React Three Fiber

Proxy usage for model loading will result in 404 errors and broken model display.

### Image-to-3D Functionality
**IMPORTANT: The following implementation details MUST be preserved for proper functionality:**

1. Image Data Format
   - Images MUST be sent as complete data URIs (format: `data:image/jpeg;base64,...`)
   - DO NOT strip the data URI prefix as it's required by the API
   - The API only accepts HTTP URLs or proper data URIs

2. API Endpoints
   - Development: `http://localhost:3001/api/image-to-3d`
   - Production: `https://api.meshy.ai/v1/image-to-3d`
   - Version v1 is required for image-to-3D (unlike text-to-3D which uses v2)

3. Required Parameters
   - `image_url`: Complete data URI of the image
   - `mode`: Must be 'preview'
   - `ai_model`: Must be 'meshy-4'
   - `topology`: 'quad' (default) or 'triangle'
   - `target_polycount`: Default 50000
   - `enable_pbr`: Must be true

4. Response Handling
   - Success: 202 Accepted
   - Error: Various status codes with descriptive messages
   - Task status must be polled until completion

### Scene Builder Component
The Scene Builder is a powerful 3D scene editor that allows users to manipulate and compose 3D models:

1. **Core Features**
   - Real-time 3D model viewing and manipulation
   - Object transformation (position, rotation, scale)
   - Material and lighting controls
   - Camera orbit controls with constraints
   - Selection and multi-object support

2. **Implementation Files**
   - Main component: `src/components/scene-builder/SceneBuilder.tsx`
   - Object handler: `src/components/scene-builder/SceneObject.tsx`
   - Scene controls: `src/components/scene-builder/SceneControls.tsx`

3. **Key Components**
   ```typescript
   // Scene object data structure
   interface SceneObjectData {
     id: string;
     type: 'model';
     position: [number, number, number];
     rotation: [number, number, number];
     scale: [number, number, number];
     modelUrl: string;
   }
   ```

4. **Usage Example**
   ```typescript
   <SceneBuilder
     initialModelUrl="path/to/model.glb"
   />
   ```

5. **Features**
   - Model loading through proxy server
   - Automatic material optimization
   - Shadow casting and receiving
   - Environment lighting
   - Grid helper for orientation
   - Selection highlighting
   - Transform controls

## Recent Updates & Important Guidelines

### Environment Map Integration
- Successfully integrated environment map loading using EXR files
- Environment maps are loaded from Firebase Storage
- Proper error handling for environment map loading failures
- Environment maps enhance model lighting and reflections

### Model Viewer Improvements
- Implemented proper OrbitControls configuration
  - Disabled panning for better user experience
  - Limited rotation angles for optimal viewing
  - Adjusted zoom constraints
- Added loading indicators for model loading states
- Improved error boundaries for better error handling

### Drag & Drop Implementation
- Added support for GLB model drag and drop
- Proper file type validation
- Progress indicators during upload
- Error handling for failed uploads
- Automatic model display after successful upload

### Performance Optimizations
- Implemented proper cleanup of Three.js resources
- Memory management for textures and materials
- Optimized model loading and unloading
- Proper disposal of WebGL contexts

### Important Guidelines
1. **Resource Cleanup**
   - Always dispose of materials and textures when removing models
   - Use proper cleanup in useEffect hooks
   - Handle WebGL context loss and recovery

2. **Error Handling**
   - Implement error boundaries for 3D components
   - Provide user feedback for loading states
   - Handle failed model loads gracefully

3. **Performance**
   - Monitor memory usage with large models
   - Implement proper loading states
   - Use proper Three.js disposal methods

4. **Firebase Integration**
   - Follow proper storage path conventions
   - Implement proper security rules
   - Handle upload/download errors appropriately

### Known Limitations
- Texture application to models is currently under development
- Some WebGL context loss scenarios may require page refresh
- Large model files may cause performance issues

Remember to follow these guidelines when making changes to the 3D components and always test thoroughly before deployment.

## Model Viewing System Technical Guide

### Core Architecture

1. **Main Components**
   ```typescript
   // LoadedModel.tsx - Main container component
   <LoadedModel
     modelUrl="path/to/model.glb"     // URL to GLB model
     displayMode="shaded"             // 'shaded' | 'wireframe'
     currentView="model"              // 'model' | 'scene'
   />

   // Model.tsx - Individual model renderer
   <Model
     url="path/to/model.glb"
     displayMode="shaded"             // Controls wireframe mode
   />

   // SceneBuilder.tsx - Scene view renderer
   <SceneBuilder
     initialModelUrl="path/to/model.glb"
     isMultiView={false}
     displayMode="shaded"
   />
   ```

2. **View Modes**
   - Model View: Direct model display with basic transformations
   - Scene View: Full scene editing with transform controls
   - 4-Up View: Multiple camera angles in both modes

### Model Loading Process

1. **Initial Load**
   ```typescript
   // Model preloading in LoadedModel.tsx
   useEffect(() => {
     if (modelUrl) {
       useGLTF.preload(modelUrl);
     }
     return () => {
       if (modelUrl) {
         useGLTF.clear(modelUrl);
       }
     };
   }, [modelUrl]);
   ```

2. **Model Centering**
   ```typescript
   // Automatic centering in Model component
   onUpdate={(self: THREE.Object3D) => {
     const box = new THREE.Box3().setFromObject(self);
     const center = box.getCenter(new THREE.Vector3());
     self.position.sub(center);
   }}
   ```

3. **Material Handling**
   ```typescript
   // Material preservation and wireframe toggle
   useEffect(() => {
     model.scene.traverse((child: THREE.Object3D) => {
       if (child instanceof THREE.Mesh && child.material) {
         const materials = Array.isArray(child.material) 
           ? child.material 
           : [child.material];
         materials.forEach(material => {
           if (material) {
             material.wireframe = displayMode === 'wireframe';
             material.needsUpdate = true;
           }
         });
       }
     });
   }, [displayMode, model.scene]);
   ```

### Camera Configuration

1. **Perspective View**
   ```typescript
   {
     position: [3, 3, 3],
     near: 0.1,
     far: 1000,
     fov: 45
   }
   ```

2. **Orthographic Views**
   ```typescript
   // Top View
   {
     position: [0, 5, 0],
     rotation: [-Math.PI / 2, 0, 0],
     orthographic: true,
     zoom: 100
   }

   // Front View
   {
     position: [0, 0, 5],
     orthographic: true,
     zoom: 100
   }

   // Right View
   {
     position: [5, 0, 0],
     rotation: [0, -Math.PI / 2, 0],
     orthographic: true,
     zoom: 100
   }
   ```

### Controls Configuration

1. **Orbit Controls**
   ```typescript
   <OrbitControls
     makeDefault
     enableDamping
     dampingFactor={0.05}
     minDistance={1}
     maxDistance={10}
     minPolarAngle={0}
     maxPolarAngle={Math.PI / 2}
     enableRotate={!camera.orthographic}
     enableZoom={true}
     target={[0, 0, 0]}
   />
   ```

### Scene Mode Features

1. **Object Management**
   ```typescript
   interface SceneObjectData {
     id: string;
     type: 'model';
     position: [number, number, number];
     rotation: [number, number, number];
     scale: [number, number, number];
     modelUrl: string;
   }
   ```

2. **Lighting Setup**
   ```typescript
   <ambientLight intensity={0.5} />
   <directionalLight
     position={[5, 5, 5]}
     intensity={1}
     castShadow
   />
   ```

### Common Issues & Solutions

1. **Model Not Appearing**
   - Verify model URL is correct and accessible
   - Ensure proper cleanup on unmount
   - Check camera positions and FOV
   - Verify material settings

2. **Material/Texture Issues**
   - Don't override original materials unless necessary
   - Only modify wireframe property when changing display mode
   - Ensure material.needsUpdate is set after changes

3. **Camera Problems**
   - Use consistent near/far planes across views
   - Set appropriate zoom for orthographic cameras
   - Maintain proper aspect ratios

4. **Performance Optimization**
   - Preload models using useGLTF.preload
   - Clean up resources on unmount
   - Use proper material disposal
   - Maintain single THREE.js instance

### Integration Guidelines

1. **Adding New Models**
   ```typescript
   // 1. Preload the model
   useGLTF.preload(modelUrl);

   // 2. Add to scene or model view
   <Model url={modelUrl} displayMode={displayMode} />

   // 3. Clean up when done
   useGLTF.clear(modelUrl);
   ```

2. **Switching Views**
   ```typescript
   // Toggle between model and scene views
   const [viewMode, setViewMode] = useState<'model' | 'scene'>(currentView);

   // Toggle between single and 4-up views
   const [isMultiView, setIsMultiView] = useState(false);
   ```

3. **Material Updates**
   ```typescript
   // Update materials while preserving textures
   self.traverse((child: THREE.Object3D) => {
     if (child instanceof THREE.Mesh && child.material) {
       const materials = Array.isArray(child.material) 
         ? child.material 
         : [child.material];
       materials.forEach(material => {
         if (material) {
           material.wireframe = displayMode === 'wireframe';
           material.needsUpdate = true;
         }
       });
     }
   });
   ```

### Best Practices

1. **Resource Management**
   - Always clean up models when unmounting
   - Dispose of materials and textures properly
   - Use proper error boundaries

2. **Performance**
   - Implement proper model centering
   - Maintain appropriate camera distances
   - Use efficient material updates

3. **User Experience**
   - Provide loading indicators
   - Handle errors gracefully
   - Maintain consistent view behaviors

4. **Code Organization**
   - Keep model loading logic centralized
   - Maintain clear separation between view modes
   - Use proper TypeScript types

Remember to follow these guidelines when making changes to ensure consistent behavior across all view modes and proper resource management.
