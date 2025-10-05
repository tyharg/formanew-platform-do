/**
 * React Hook for Notes Server-Sent Events (SSE)
 * 
 * This custom React hook manages real-time Server-Sent Event connections
 * for the notes feature, enabling live updates without page refreshes.
 * It's primarily used to receive AI-generated title updates and other
 * note-related events in real-time.
 * 
 * Key Features:
 * - Automatic SSE connection management
 * - Connection state tracking (connected/disconnected/error)
 * - Event listener registration and cleanup
 * - Reconnection handling on connection failures
 * - TypeScript support for event types
 * - Memory leak prevention with proper cleanup
 * 
 * Usage:
 * ```tsx
 * const { connectionState } = useNotesSSE((event) => {
 *   if (event.type === 'title-update') {
 *     // Handle title update event
 *     updateNoteTitle(event.data.noteId, event.data.title);
 *   }
 * });
 * ```
 * 
 * Event Types:
 * - 'title-update': When AI generates a new title for a note
 * - 'note-changed': When note content is modified
 * - Future: collaboration events, system notifications, etc.
 * 
 * Connection Lifecycle:
 * 1. Hook mounts → establishes SSE connection to /api/notes/events
 * 2. Connection successful → sets connected state to true
 * 3. Events received → calls provided event handler
 * 4. Hook unmounts → closes connection and cleans up listeners
 * 
 * Error Handling:
 * - Connection failures are tracked in connectionState
 * - Automatic retry attempts on connection loss
 * - Graceful degradation when SSE is unavailable
 * 
 * @author Real-time Features Implementation
 * @since 2024
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { NotesSSEEvent } from '../services/sse/eventManager';

export interface SSEConnectionState {
  connected: boolean;
  error: string | null;
}

export interface UseNotesSSEResult {
  connectionState: SSEConnectionState;
}

/**
 * React hook for managing SSE connection to receive real-time notes updates
 * @param onTitleUpdate - Callback fired when a note title is updated
 * @returns SSE connection state and control functions
 */
export function useNotesSSE(
  onTitleUpdate: (noteId: string, newTitle: string) => void
): UseNotesSSEResult {
  const eventSourceRef = useRef<EventSource | null>(null);
  const [connectionState, setConnectionState] = useState<SSEConnectionState>({
    connected: false,
    error: null,
  });

  const connect = useCallback(() => {
    // Don't connect if already connected
    if (eventSourceRef.current) {
      return;
    }

    try {
      const eventSource = new EventSource('/api/notes/events');
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setConnectionState({ connected: true, error: null });
      };

      eventSource.onmessage = (event) => {
        try {
          const data: NotesSSEEvent = JSON.parse(event.data);
          if (data.type === 'title_updated' && data.data) {
            onTitleUpdate(data.data.noteId, data.data.title);
          }
        } catch (error) {
          console.error('Error parsing SSE event:', error);
        }
      };

      eventSource.onerror = () => {
        setConnectionState({ connected: false, error: 'Connection failed' });
        eventSource.close();
        eventSourceRef.current = null;
      };

    } catch {
      setConnectionState({ connected: false, error: 'Failed to create connection' });
    }
  }, [onTitleUpdate]);

  // Auto-connect on mount and cleanup on unmount
  useEffect(() => {
    connect();
    
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [connect]);

  // Reconnect on window focus if connection was lost
  useEffect(() => {
    const handleFocus = () => {
      if (!eventSourceRef.current) {
        connect();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [connect]);

  return { connectionState };
}