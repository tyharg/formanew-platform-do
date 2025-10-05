/**
 * Background AI Title Generation Service
 * 
 * Handles asynchronous AI title generation for notes without blocking note creation.
 * Updates titles in background and notifies frontend via SSE.
 */

import { generateTitleWithFallback } from './digitalOceanInferenceService';
import { createDatabaseService } from '../database/databaseFactory';
import { hasAIConfiguredServer } from '../../settings';
import { broadcastTitleUpdate } from '../sse/eventManager';

/**
 * Background service for generating and updating note titles
 */
export class BackgroundTitleService {
  /**
   * Generate title for a note in the background and update it
   * @param noteId - The ID of the note to update
   * @param content - The content to generate title from
   * @param userId - The ID of the user who owns the note
   */
  static async generateTitleInBackground(noteId: string, content: string, userId: string): Promise<void> {
    // Only proceed if AI is configured
    if (!hasAIConfiguredServer) {
      return;
    }

    try {
      // Generate title using AI with fallback
      const generatedTitle = await generateTitleWithFallback(content);
      
      // Update the note with the generated title
      const dbClient = await createDatabaseService();
      await dbClient.note.update(noteId, {
        title: generatedTitle,
      });
      
      // Broadcast SSE event to notify the frontend
      broadcastTitleUpdate(noteId, generatedTitle, userId);
    } catch (error) {
      console.error(`Failed to generate title for note ${noteId}:`, error);
      // Note: We don't throw here because background processing should be non-blocking
      // The note will keep its timestamp title if AI generation fails
    }
  }

  /**
   * Queue title generation for a note (fire-and-forget)
   * @param noteId - The ID of the note to update
   * @param content - The content to generate title from
   * @param userId - The ID of the user who owns the note
   */
  static queueTitleGeneration(noteId: string, content: string, userId: string): void {
    // Fire-and-forget: don't await this
    this.generateTitleInBackground(noteId, content, userId).catch((error) => {
      console.error(`Background title generation failed for note ${noteId}:`, error);
    });
  }
}

/**
 * Convenience function to trigger background title generation
 * @param noteId - The ID of the note to update  
 * @param content - The content to generate title from
 * @param userId - The ID of the user who owns the note
 */
export function triggerBackgroundTitleGeneration(noteId: string, content: string, userId: string): void {
  BackgroundTitleService.queueTitleGeneration(noteId, content, userId);
}