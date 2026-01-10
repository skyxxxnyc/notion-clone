# File Upload & Image Gallery Blocks

This directory contains reusable block components for file uploads and image galleries in the Notion clone.

## Components

### FileUpload

A drag-and-drop file upload component with support for various file types.

**Features:**
- Drag and drop file uploads
- Click to browse files
- File type validation
- File size limits (default 50MB)
- Progress indication
- File preview list
- Delete uploaded files
- Support for images, videos, audio, and documents

**Usage:**
```tsx
import { FileUpload } from '@/components/blocks';

<FileUpload
  pageId={pageId}
  onUploadComplete={(url, name, type) => {
    console.log('File uploaded:', url);
  }}
  acceptedTypes={['image/jpeg', 'image/png', 'application/pdf']}
  maxSize={50 * 1024 * 1024} // 50MB
/>
```

**Props:**
- `pageId` (required): The ID of the page where files are being uploaded
- `onUploadComplete`: Callback when upload completes
- `acceptedTypes`: Array of accepted MIME types
- `maxSize`: Maximum file size in bytes
- `className`: Additional CSS classes

### ImageGallery

A responsive image gallery component with lightbox and multiple layout options.

**Features:**
- Grid, masonry, and carousel layouts
- Lightbox modal view
- Image navigation (prev/next)
- Download images
- Image captions
- Remove images (when editable)
- Responsive design

**Usage:**
```tsx
import { ImageGallery } from '@/components/blocks';

<ImageGallery
  images={[
    { id: '1', url: '/image1.jpg', caption: 'Photo 1' },
    { id: '2', url: '/image2.jpg', caption: 'Photo 2' },
  ]}
  layout="grid"
  columns={3}
  editable={true}
  onRemoveImage={(id) => console.log('Remove:', id)}
/>
```

**Props:**
- `images`: Array of image objects with `id`, `url`, `caption`, and `alt`
- `layout`: 'grid', 'masonry', or 'carousel'
- `columns`: 2, 3, or 4 columns for grid layout
- `onRemoveImage`: Callback when removing an image
- `editable`: Whether images can be removed
- `className`: Additional CSS classes

## API Routes

### POST /api/upload

Upload files to Supabase Storage.

**Request:**
```typescript
FormData {
  file: File
  workspaceId: string
  pageId?: string
}
```

**Response:**
```typescript
{
  id: string
  url: string
  name: string
  type: 'images' | 'videos' | 'audio' | 'documents' | 'files'
  mimeType: string
  size: number
  storagePath: string
}
```

### GET /api/upload

Retrieve file metadata.

**Query Parameters:**
- `fileId`: Get specific file
- `pageId`: Get all files for a page
- `workspaceId`: Get all files for a workspace

### DELETE /api/upload

Delete a file from storage and database.

**Query Parameters:**
- `fileId`: The ID of the file to delete

## Database Schema

The files are stored in the `files` table:

```sql
CREATE TABLE files (
  id UUID PRIMARY KEY,
  workspace_id UUID NOT NULL,
  page_id UUID,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size BIGINT NOT NULL,
  storage_path TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  uploaded_by UUID NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB
);
```

Files are stored in Supabase Storage bucket `workspace-files` with path structure:
```
{workspaceId}/{category}/{timestamp}-{filename}
```

## Slash Commands

Use the slash command menu in the editor to insert these blocks:

- `/file` or `/upload` - Insert a file upload block
- `/gallery` or `/images` - Insert an image gallery block

## Supported File Types

**Images:**
- JPEG, PNG, GIF, WebP, SVG

**Videos:**
- MP4, WebM, OGG, QuickTime

**Documents:**
- PDF, Word (.doc, .docx), Excel (.xls, .xlsx), PowerPoint (.ppt, .pptx)
- Plain text, CSV

**Audio:**
- MP3, WAV, OGG, WebM

## Security & Permissions

- File uploads are restricted to authenticated users
- Users can only upload to workspaces they're members of
- Row Level Security (RLS) policies enforce workspace access
- File size limits prevent abuse
- File type validation prevents malicious uploads
- Storage bucket policies restrict access to workspace members

## Setup

1. **Supabase Storage Bucket**: Create a public bucket named `workspace-files` in your Supabase project

2. **Database Migration**: Run the migration file:
   ```bash
   supabase migration up
   ```

3. **Environment Variables**: Ensure your Supabase credentials are configured in `.env.local`

## Future Enhancements

- [ ] Image compression before upload
- [ ] Multiple file selection
- [ ] Upload progress bars
- [ ] Batch operations
- [ ] File search and filtering
- [ ] File versioning
- [ ] Shared file libraries
- [ ] External storage providers (S3, CloudFlare R2)
