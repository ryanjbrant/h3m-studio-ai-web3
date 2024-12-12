# H3M Studio AI Web3

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
