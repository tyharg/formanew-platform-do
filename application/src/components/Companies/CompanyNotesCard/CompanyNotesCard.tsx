'use client';

import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemText,
  Tooltip,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { CompanyNote } from 'lib/api/companies';

interface CompanyNotesCardProps {
  notes: CompanyNote[];
  onAddNote: () => void;
  onDeleteNote: (note: CompanyNote) => void;
}

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.toLocaleDateString()} • ${date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
};

const CompanyNotesCard: React.FC<CompanyNotesCardProps> = ({ notes, onAddNote, onDeleteNote }) => {
  return (
    <Card variant="outlined">
      <CardHeader
        title={
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" fontWeight={600}>
              Relationship Notes
            </Typography>
            <Button variant="outlined" size="small" onClick={onAddNote}>
              Add Note
            </Button>
          </Box>
        }
      />
      <CardContent>
        {notes.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Log context, meeting recaps, or next steps to keep your team aligned.
          </Typography>
        ) : (
          <List disablePadding>
            {notes.map((note) => (
              <ListItem
                key={note.id}
                divider
                alignItems="flex-start"
                secondaryAction={
                  <Tooltip title="Delete note">
                    <IconButton size="small" onClick={() => onDeleteNote(note)} color="error">
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                }
              >
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" color="text.secondary">
                      {note.authorName || 'Internal Note'} • {formatDateTime(note.createdAt)}
                    </Typography>
                  }
                  secondary={
                    <Typography sx={{ whiteSpace: 'pre-wrap' }} variant="body1">
                      {note.content}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default CompanyNotesCard;
