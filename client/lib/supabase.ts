import { createClient } from '@supabase/supabase-js'

// Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dummy-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'dummy-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// File upload utility for assignments
export const uploadAssignmentFile = async (file: File, fileName: string) => {
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
    console.error('Error uploading file:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    }
  }
}

// Assignment data types
export interface Assignment {
  id: string
  title: string
  description: string
  dueDate: string
  fileUrl?: string
  fileName?: string
  fileSize?: number
  createdAt: string
  teacherId: string
  teacherName: string
  status: 'active' | 'draft' | 'closed'
}

// In-memory storage for assignments (replace with actual database later)
let assignments: Assignment[] = [
  {
    id: '1',
    title: 'Mathematics Quiz - Algebra Basics',
    description: 'Complete the algebra problems covering linear equations and basic functions.',
    dueDate: '2024-01-15',
    createdAt: '2024-01-01',
    teacherId: 'teacher1',
    teacherName: 'John Smith',
    status: 'active'
  },
  {
    id: '2',
    title: 'Science Project - Solar System',
    description: 'Create a presentation about the solar system including all planets and their characteristics.',
    dueDate: '2024-01-20',
    createdAt: '2024-01-05',
    teacherId: 'teacher1',
    teacherName: 'John Smith',
    status: 'active'
  }
]

// Assignment management functions
export const getAssignments = (): Assignment[] => {
  return assignments
}

export const createAssignment = (assignment: Omit<Assignment, 'id' | 'createdAt'>): Assignment => {
  const newAssignment: Assignment = {
    ...assignment,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  }
  assignments.push(newAssignment)
  return newAssignment
}

export const updateAssignment = (id: string, updates: Partial<Assignment>): Assignment | null => {
  const index = assignments.findIndex(a => a.id === id)
  if (index === -1) return null
  
  assignments[index] = { ...assignments[index], ...updates }
  return assignments[index]
}

export const deleteAssignment = (id: string): boolean => {
  const index = assignments.findIndex(a => a.id === id)
  if (index === -1) return false
  
  assignments.splice(index, 1)
  return true
}
