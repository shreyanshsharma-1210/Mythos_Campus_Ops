import { supabase } from './supabase';

// File upload utility for assignment materials
export const uploadAssignmentMaterial = async (file: File, fileName: string) => {
  try {
    const fileExt = file.name.split('.').pop()
    const filePath = `assignments/${Date.now()}-${fileName}.${fileExt}`
    
    const { data, error } = await supabase.storage
      .from('assignments')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      throw error
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('assignments')
      .getPublicUrl(filePath)

    return {
      success: true,
      filePath: data.path,
      publicUrl,
      fileName: file.name,
      fileSize: file.size
    }
  } catch (error) {
    console.error('Error uploading assignment material:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    }
  }
}

// Upload profile pictures
export const uploadProfilePicture = async (file: File, userId: string) => {
  try {
    const fileExt = file.name.split('.').pop()
    const filePath = `profiles/${userId}/avatar.${fileExt}`
    
    const { data, error } = await supabase.storage
      .from('profiles')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true // Allow overwriting existing profile pictures
      })

    if (error) {
      throw error
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profiles')
      .getPublicUrl(filePath)

    return {
      success: true,
      filePath: data.path,
      publicUrl,
      fileName: file.name,
      fileSize: file.size
    }
  } catch (error) {
    console.error('Error uploading profile picture:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    }
  }
}

// Upload submission files
export const uploadSubmissionFile = async (file: File, assignmentId: string, studentId: string) => {
  try {
    const fileExt = file.name.split('.').pop()
    const filePath = `submissions/${assignmentId}/${studentId}/${Date.now()}-${file.name}`
    
    const { data, error } = await supabase.storage
      .from('submissions')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      throw error
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('submissions')
      .getPublicUrl(filePath)

    return {
      success: true,
      filePath: data.path,
      publicUrl,
      fileName: file.name,
      fileSize: file.size
    }
  } catch (error) {
    console.error('Error uploading submission file:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    }
  }
}

// Delete file from storage
export const deleteFile = async (bucket: string, filePath: string) => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath])

    if (error) {
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting file:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed'
    }
  }
}

// Get file URL
export const getFileUrl = (bucket: string, filePath: string) => {
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)
  
  return publicUrl
}

// Download file from storage
export const downloadFile = async (bucket: string, filePath: string, fileName?: string) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(filePath)

    if (error) {
      throw error
    }

    // Create a blob URL for download
    const url = URL.createObjectURL(data)
    
    // Create a temporary link element to trigger download
    const link = document.createElement('a')
    link.href = url
    link.download = fileName || filePath.split('/').pop() || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Clean up the blob URL
    URL.revokeObjectURL(url)

    return { success: true }
  } catch (error) {
    console.error('Error downloading file:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Download failed'
    }
  }
}

// Get signed URL for private files
export const getSignedUrl = async (bucket: string, filePath: string, expiresIn: number = 3600) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn)

    if (error) {
      throw error
    }

    return {
      success: true,
      signedUrl: data.signedUrl
    }
  } catch (error) {
    console.error('Error creating signed URL:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create signed URL'
    }
  }
}
