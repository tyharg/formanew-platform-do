import NoteDetailsPage from 'components/Notes/NoteDetailsPage';

interface NoteRouteProps {
  params: Promise<{
    noteId: string;
  }>;
}

export default async function NoteRoute({ params }: NoteRouteProps) {
  const { noteId } = await params;
  return <NoteDetailsPage noteId={noteId} />;
}
