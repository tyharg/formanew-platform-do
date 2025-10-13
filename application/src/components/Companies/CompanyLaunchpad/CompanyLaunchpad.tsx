'use client';

import React, { useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import { Company } from 'lib/api/companies';

interface CompanyLaunchpadProps {
  company: Company;
  onEditSettings: () => void;
  onAddContact: () => void;
  onAddNote: () => void;
}

type LaunchpadTask = {
  id: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  complete: boolean;
};

const hasProfileDetails = (company: Company) => {
  const fields = [
    company.industry,
    company.website,
    company.email,
    company.phone,
    company.description,
  ];
  const addressFields = [
    company.addressLine1,
    company.city,
    company.state,
    company.postalCode,
    company.country,
  ];
  return fields.some(Boolean) || addressFields.every(Boolean);
};

const CompanyLaunchpad: React.FC<CompanyLaunchpadProps> = ({
  company,
  onEditSettings,
  onAddContact,
  onAddNote,
}) => {
  const tasks = useMemo<LaunchpadTask[]>(() => {
    const contacts = company.contacts ?? [];
    const notes = company.notes ?? [];
    const contracts = company.contracts ?? [];

    const primaryContact = contacts.find((contact) => contact.isPrimary);

    return [
      {
        id: 'profile',
        title: 'Complete company profile',
        description: 'Add industry, contact methods, or a short description to help automate filings.',
        actionLabel: hasProfileDetails(company) ? undefined : 'Add details',
        onAction: hasProfileDetails(company) ? undefined : onEditSettings,
        complete: hasProfileDetails(company),
      },
      {
        id: 'contact',
        title: 'Set a primary contact',
        description: 'Designate who will receive state notices and onboarding emails.',
        actionLabel: primaryContact ? undefined : 'Add contact',
        onAction: primaryContact ? undefined : onAddContact,
        complete: Boolean(primaryContact),
      },
      {
        id: 'ein',
        title: 'Capture EIN',
        description: 'Record your Employer Identification Number for banking and tax filings.',
        actionLabel: company.ein ? undefined : 'Add EIN',
        onAction: company.ein ? undefined : onEditSettings,
        complete: Boolean(company.ein),
      },
      {
        id: 'contract',
        title: 'Track your first contract',
        description: 'Log your first client or vendor agreement to centralize paperwork.',
        complete: (contracts?.length ?? 0) > 0,
      },
      {
        id: 'note',
        title: 'Add a launch note',
        description: 'Capture ideas, partners, or launch tasks so nothing slips.',
        actionLabel: notes.length > 0 ? undefined : 'Add note',
        onAction: notes.length > 0 ? undefined : onAddNote,
        complete: notes.length > 0,
      },
    ];
  }, [company, onAddContact, onAddNote, onEditSettings]);

  const completedCount = tasks.filter((task) => task.complete).length;
  const progress = Math.round((completedCount / tasks.length) * 100);

  return (
    <Stack spacing={3}>
      <Card variant="outlined">
        <CardHeader
          title={
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6" fontWeight={600}>
                Launch Checklist
              </Typography>
              <Chip color={progress === 100 ? 'success' : 'primary'} label={`${progress}%`} />
            </Box>
          }
          subheader="Follow these quick wins to get your LLC paperwork ready."
        />
        <CardContent>
          <Box mb={2}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Box>
          <Stack spacing={2}>
            {tasks.map((task, index) => (
              <React.Fragment key={task.id}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {task.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {task.description}
                    </Typography>
                  </Box>
                  {task.complete ? (
                    <Chip label="Done" color="success" size="small" />
                  ) : task.actionLabel && task.onAction ? (
                    <Button variant="outlined" size="small" onClick={task.onAction}>
                      {task.actionLabel}
                    </Button>
                  ) : (
                    <Chip label="Pending" color="default" size="small" variant="outlined" />
                  )}
                </Box>
                {index < tasks.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardHeader title="Fast facts" subheader="What we know so far about this business." />
        <CardContent>
          <Stack spacing={1.5}>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Formation state
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {company.state || 'TBD'}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Industry focus
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {company.industry || 'Set in settings'}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Primary contact
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {company.contacts?.find((contact) => contact.isPrimary)?.fullName || 'Not assigned'}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Contracts tracked
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {company.contracts?.length ?? 0}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default CompanyLaunchpad;
