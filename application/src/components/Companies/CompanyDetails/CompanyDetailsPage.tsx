'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import PageContainer from 'components/Common/PageContainer/PageContainer';
import Toast from 'components/Common/Toast/Toast';
import CompanyForm from '../CompanyForm/CompanyForm';
import CompanyContactsCard from '../CompanyContactsCard/CompanyContactsCard';
import CompanyContactForm from '../CompanyContactForm/CompanyContactForm';
import CompanyNotesCard from '../CompanyNotesCard/CompanyNotesCard';
import CompanyLaunchpad from '../CompanyLaunchpad/CompanyLaunchpad';
import CompanyNoteForm from '../CompanyNoteForm/CompanyNoteForm';

import {
  CompaniesApiClient,
  Company,
  CompanyContact,
  CompanyNote,
  CreateCompanyContactPayload,
  CreateCompanyNotePayload,
  UpdateCompanyContactPayload,
  UpdateCompanyPayload,
} from 'lib/api/companies';

const companiesClient = new CompaniesApiClient();

type TabKey = 'launchpad' | 'settings' | 'contacts' | 'notes' | 'contracts';

interface CompanyDetailsPageProps {
  companyId: string;
}

const tabConfig: { key: TabKey; label: string }[] = [
  { key: 'launchpad', label: 'Launchpad' },
  { key: 'settings', label: 'Settings' },
  { key: 'contacts', label: 'Contacts' },
  { key: 'notes', label: 'Notes' },
  { key: 'contracts', label: 'Contracts' },
];

const CompanyDetailsPage: React.FC<CompanyDetailsPageProps> = ({ companyId }) => {
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('launchpad');

  const [isSaving, setIsSaving] = useState(false);
  const [formResetKey, setFormResetKey] = useState(0);

  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactFormMode, setContactFormMode] = useState<'create' | 'edit'>('create');
  const [contactDraft, setContactDraft] = useState<CompanyContact | null>(null);
  const [isContactSubmitting, setIsContactSubmitting] = useState(false);

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isNoteSubmitting, setIsNoteSubmitting] = useState(false);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error' | 'info' | 'warning'>(
    'success'
  );

  const showToast = (message: string, severity: typeof toastSeverity = 'success') => {
    setToastMessage(message);
    setToastSeverity(severity);
    setToastOpen(true);
  };

  const resetToast = () => {
    setToastOpen(false);
    setToastMessage('');
  };

  const loadCompany = useCallback(
    async (withSpinner = false) => {
      try {
        if (withSpinner) {
          setIsLoading(true);
        }
        setError(null);
        const response = await companiesClient.getCompany(companyId);
        setCompany(response);
      } catch (err) {
        console.error('Failed to load company', err);
        setError('Unable to load company right now. Please try again later.');
        if (withSpinner) {
          setCompany(null);
        }
      } finally {
        if (withSpinner) {
          setIsLoading(false);
        }
      }
    },
    [companyId],
  );

  useEffect(() => {
    loadCompany(true);
  }, [loadCompany]);

  const formInitialValues = useMemo(() => {
    if (!company) return undefined;
    return {
      legalName: company.legalName,
      displayName: company.displayName ?? '',
      industry: company.industry ?? '',
      ein: company.ein ?? '',
      formationDate: company.formationDate ?? '',
      website: company.website ?? '',
      phone: company.phone ?? '',
      email: company.email ?? '',
      addressLine1: company.addressLine1 ?? '',
      addressLine2: company.addressLine2 ?? '',
      city: company.city ?? '',
      state: company.state ?? '',
      postalCode: company.postalCode ?? '',
      country: company.country ?? '',
      description: company.description ?? '',
    };
  }, [company]);

  const handleSettingsSubmit = async (payload: UpdateCompanyPayload) => {
    try {
      setIsSaving(true);
      const updated = await companiesClient.updateCompany(companyId, payload);
      setCompany(updated);
      setFormResetKey((key) => key + 1);
      showToast('Company settings saved.');
    } catch (err) {
      console.error('Failed to update company', err);
      showToast('Unable to save company. Try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSettingsReset = () => {
    setFormResetKey((key) => key + 1);
  };

  const handleContactSubmit = async (
    payload: CreateCompanyContactPayload | UpdateCompanyContactPayload,
    contactId?: string
  ) => {
    if (!company) return;

    try {
      setIsContactSubmitting(true);
      if (contactFormMode === 'create') {
        await companiesClient.createContact(payload as CreateCompanyContactPayload);
        showToast('Contact added.');
      } else if (contactId) {
        await companiesClient.updateContact(company.id, contactId, payload as UpdateCompanyContactPayload);
        showToast('Contact updated.');
      }
      setIsContactModalOpen(false);
      setContactDraft(null);
      await loadCompany();
    } catch (err) {
      console.error('Failed to save contact', err);
      showToast('Unable to save contact. Try again.', 'error');
    } finally {
      setIsContactSubmitting(false);
    }
  };

  const handleDeleteContact = async (contact: CompanyContact) => {
    if (!company) return;

    try {
      await companiesClient.deleteContact(company.id, contact.id);
      showToast('Contact removed.');
      await loadCompany();
    } catch (err) {
      console.error('Failed to delete contact', err);
      showToast('Unable to delete contact. Try again.', 'error');
    }
  };

  const handleNoteSubmit = async (payload: CreateCompanyNotePayload) => {
    try {
      setIsNoteSubmitting(true);
      await companiesClient.createNote(payload);
      showToast('Note added.');
      setIsNoteModalOpen(false);
      await loadCompany();
    } catch (err) {
      console.error('Failed to save note', err);
      showToast('Unable to save note. Try again.', 'error');
    } finally {
      setIsNoteSubmitting(false);
    }
  };

  const handleDeleteNote = async (note: CompanyNote) => {
    if (!company) return;

    try {
      await companiesClient.deleteNote(company.id, note.id);
      showToast('Note deleted.');
      await loadCompany();
    } catch (err) {
      console.error('Failed to delete note', err);
      showToast('Unable to delete note. Try again.', 'error');
    }
  };

  if (isLoading) {
    return (
      <PageContainer title="Company" sx={{ minHeight: '60vh' }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={240}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (!company) {
    return (
      <PageContainer title="Company" sx={{ minHeight: '60vh' }}>
        <Alert severity="error">{error || 'Company not found.'}</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={company.displayName || company.legalName || 'Company'}
      sx={{ minHeight: '60vh' }}
    >
      <Stack spacing={4}>
        {error && <Alert severity="error">{error}</Alert>}

        <Box>
          <Tabs
            value={activeTab}
            onChange={(_, value: TabKey) => setActiveTab(value)}
            aria-label="Company detail tabs"
          >
            {tabConfig.map((tab) => (
              <Tab key={tab.key} label={tab.label} value={tab.key} />
            ))}
          </Tabs>
        </Box>

        {activeTab === 'settings' && (
          <CompanyForm
            key={`${company.id}-${formResetKey}`}
            mode="edit"
            initialValues={formInitialValues}
            onSubmit={async (payload) => {
              await handleSettingsSubmit(payload as UpdateCompanyPayload);
            }}
            onCancel={handleSettingsReset}
            isSubmitting={isSaving}
          />
        )}

        {activeTab === 'launchpad' && (
          <CompanyLaunchpad
            company={company}
            onEditSettings={() => setActiveTab('settings')}
            onAddContact={() => {
              setActiveTab('contacts');
              setContactFormMode('create');
              setContactDraft(null);
              setIsContactModalOpen(true);
            }}
            onAddNote={() => {
              setActiveTab('notes');
              setIsNoteModalOpen(true);
            }}
          />
        )}



        {activeTab === 'contacts' && (
          <CompanyContactsCard
            contacts={company.contacts ?? []}
            onAddContact={() => {
              setContactFormMode('create');
              setContactDraft(null);
              setIsContactModalOpen(true);
            }}
            onEditContact={(contact) => {
              setContactFormMode('edit');
              setContactDraft(contact);
              setIsContactModalOpen(true);
            }}
            onDeleteContact={handleDeleteContact}
          />
        )}

        {activeTab === 'notes' && (
          <CompanyNotesCard
            notes={company.notes ?? []}
            onAddNote={() => setIsNoteModalOpen(true)}
            onDeleteNote={handleDeleteNote}
          />
        )}

        {activeTab === 'contracts' && (
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Contracts
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Contracts management will be available here soon.
            </Typography>
          </Box>
        )}
      </Stack>

      <Dialog
        open={isContactModalOpen}
        onClose={() => (isContactSubmitting ? undefined : setIsContactModalOpen(false))}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent dividers sx={{ p: 3 }}>
          <CompanyContactForm
            mode={contactFormMode}
            companyId={company.id}
            initialValues={contactDraft ?? undefined}
            onSubmit={handleContactSubmit}
            onCancel={() => {
              if (!isContactSubmitting) {
                setIsContactModalOpen(false);
                setContactDraft(null);
              }
            }}
            isSubmitting={isContactSubmitting}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={isNoteModalOpen}
        onClose={() => (isNoteSubmitting ? undefined : setIsNoteModalOpen(false))}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent dividers sx={{ p: 3 }}>
          <CompanyNoteForm
            companyId={company.id}
            onSubmit={handleNoteSubmit}
            onCancel={() => {
              if (!isNoteSubmitting) {
                setIsNoteModalOpen(false);
              }
            }}
            isSubmitting={isNoteSubmitting}
          />
        </DialogContent>
      </Dialog>

      <Toast open={toastOpen} message={toastMessage} severity={toastSeverity} onClose={resetToast} />
    </PageContainer>
  );
};

export default CompanyDetailsPage;
