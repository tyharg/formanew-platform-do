'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tooltip,
  Typography,
  Avatar,
  Button,
} from '@mui/material';
import { Edit, Delete, Person } from '@mui/icons-material';
import { CompanyContact } from 'lib/api/companies';

interface CompanyContactsCardProps {
  contacts: CompanyContact[];
  onAddContact: () => void;
  onEditContact: (contact: CompanyContact) => void;
  onDeleteContact: (contact: CompanyContact) => void;
}

const CompanyContactsCard: React.FC<CompanyContactsCardProps> = ({
  contacts,
  onAddContact,
  onEditContact,
  onDeleteContact,
}) => {
  return (
    <Card variant="outlined">
      <CardHeader
        title={
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" fontWeight={600}>
              Key Contacts
            </Typography>
            <Button variant="outlined" size="small" onClick={onAddContact}>
              Add Contact
            </Button>
          </Box>
        }
      />
      <CardContent>
        {contacts.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No contacts recorded yet. Add stakeholders or decision makers to stay on top of communication.
          </Typography>
        ) : (
          <List disablePadding>
            {contacts.map((contact) => (
              <ListItem
                key={contact.id}
                divider
                secondaryAction={
                  <Box display="flex" gap={1}>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => onEditContact(contact)} size="small">
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Remove">
                      <IconButton
                        onClick={() => onDeleteContact(contact)}
                        size="small"
                        color="error"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              >
                <ListItemAvatar>
                  <Avatar>
                    <Person fontSize="small" />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {contact.fullName}
                      </Typography>
                      {contact.isPrimary && <Chip size="small" label="Primary" color="primary" />}
                    </Box>
                  }
                  secondary={
                    <Box display="flex" flexDirection="column" gap={0.5}>
                      {contact.title && (
                        <Typography variant="body2" color="text.secondary">
                          {contact.title}
                        </Typography>
                      )}
                      <Typography variant="body2" color="text.secondary">
                        {[contact.email, contact.phone].filter(Boolean).join(' • ') || '—'}
                      </Typography>
                    </Box>
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

export default CompanyContactsCard;
