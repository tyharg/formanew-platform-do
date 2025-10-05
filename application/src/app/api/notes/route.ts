import { withAuth } from 'lib/auth/withAuth';
import { getAllNotes } from './getAllNotes';
import { createNote } from './createNote';

export const GET = withAuth(getAllNotes);

export const POST = withAuth(createNote);
