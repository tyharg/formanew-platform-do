import { HTTP_STATUS } from 'lib/api/http';
import { NextResponse } from 'next/server';

/**
 * Handles GET requests for the health endpoint.
 * @returns {NextResponse} JSON response with status 'ok'.
 */
export const GET = () => {
  return NextResponse.json({ status: 'ok' }, { status: HTTP_STATUS.OK });
};
