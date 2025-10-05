/**
 * Global Type Declarations for Real-time Features
 * 
 * This file contains TypeScript declarations for global variables used
 * in the Server-Sent Events (SSE) implementation. These globals are
 * necessary for managing persistent connections across API routes in
 * the Next.js serverless environment.
 * 
 * Purpose:
 * - Declares server-side global variables for SSE connection tracking
 * - Enables type safety for cross-module connection management
 * - Supports real-time features like AI title updates
 * 
 * Global Variables:
 * - sseConnections: Map of active SSE connections by user ID
 *   Used by eventManager to broadcast events to specific users
 *   Enables real-time updates without WebSocket complexity
 * 
 * Architecture Notes:
 * - Globals are used because Next.js API routes are serverless
 * - Each API route execution shares the same global scope
 * - Connections persist across requests until client disconnects
 * - Memory cleanup happens automatically on connection close
 * 
 * Usage Context:
 * - Background title generation services broadcast events
 * - SSE API endpoint manages connection lifecycle
 * - Event manager uses global map for message delivery
 * 
 * @author Real-time Features Implementation
 * @since 2024
 */

declare global {
  /**
   * Global SSE connections map for tracking active connections
   * Maps user ID to their SSE controller for real-time event delivery
   */
  // eslint-disable-next-line no-var
  var sseConnections: Map<string, ReadableStreamDefaultController> | undefined;
}

export {};