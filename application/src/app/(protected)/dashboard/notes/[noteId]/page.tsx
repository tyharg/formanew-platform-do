import NoteDetailsPage from 'components/Notes/NoteDetailsPage';

interface NoteRouteProps {
  params: {
    noteId: string;
  };
}

export default function NoteRoute({ params }: NoteRouteProps) {
  return <NoteDetailsPage noteId={params.noteId} />;
}
