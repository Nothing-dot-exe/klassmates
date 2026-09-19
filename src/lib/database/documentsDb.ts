import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { DocumentItem } from '@/types';

/**
 * DOCUMENTS DATABASE OPERATIONS
 */

export const dbFetchDocuments = async (classroomId: string): Promise<DocumentItem[] | null> => {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('classroom_id', classroomId)
      .order('created_at', { ascending: false });

    if (error || !data) return null;

    return data.map((d) => ({
      id: d.id,
      title: d.title,
      fileName: d.file_name,
      fileType: d.file_type,
      fileSize: d.file_size,
      uploadedBy: d.uploaded_by,
      uploaderName: d.uploader_name,
      uploadedAt: d.uploaded_at,
      subject: d.subject,
      source: d.source,
      sourceChannel: d.source_channel || undefined,
      downloadUrl: d.download_url || '#',
      content: d.content || undefined,
      tags: d.tags || [],
    }));
  } catch (err) {
    console.warn('Error fetching documents from Supabase:', err);
    return null;
  }
};

export const dbCreateDocument = async (doc: DocumentItem, classroomId: string): Promise<boolean> => {
  if (!isSupabaseConfigured() || !supabase) return false;

  try {
    const { error } = await supabase.from('documents').insert({
      id: doc.id,
      classroom_id: classroomId,
      title: doc.title,
      file_name: doc.fileName,
      file_type: doc.fileType,
      file_size: doc.fileSize,
      uploaded_by: doc.uploadedBy,
      uploader_name: doc.uploaderName,
      uploaded_at: doc.uploadedAt,
      subject: doc.subject,
      source: doc.source,
      source_channel: doc.sourceChannel || null,
      download_url: doc.downloadUrl,
      content: doc.content || null,
      tags: doc.tags || [],
    });

    return !error;
  } catch (err) {
    console.warn('Error creating document in Supabase:', err);
    return false;
  }
};

export const dbDeleteDocument = async (docId: string, classroomId: string): Promise<boolean> => {
  if (!isSupabaseConfigured() || !supabase) return false;

  try {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', docId)
      .eq('classroom_id', classroomId);

    return !error;
  } catch (err) {
    console.warn('Error deleting document from Supabase:', err);
    return false;
  }
};
