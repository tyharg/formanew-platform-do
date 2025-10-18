'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import { Incorporation, IncorporationStatus } from 'types';
import { FormFieldValue } from './types';
import BusinessAddressForm from './BusinessAddressForm';
import BusinessInformationForm from './BusinessInformationForm';
import CompanyDetailsForm from './CompanyDetailsForm';
import AttestationForm from './AttestationForm';

const steps = [
  'Business Information',
  'Business Address',
  'Company Details',
  'Attestation',
];

interface IncorporationFormProps {
  companyId: string;
  onDataLoaded?: (incorporation: Incorporation | null) => void;
}

const IncorporationForm: React.FC<IncorporationFormProps> = ({ companyId, onDataLoaded }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<Partial<Incorporation>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const syncData = (data: Incorporation | null) => {
    if (data) {
      setFormData(data);
      const submitted =
        data.status === IncorporationStatus.SUBMITTED || Boolean(data.submittedAt) || Boolean(data.isComplete);
      setIsSubmitted(submitted);
      setActiveStep((prev) => (submitted ? steps.length : Math.min(prev, steps.length - 1)));
    } else {
      setFormData({});
      setIsSubmitted(false);
      setActiveStep(0);
    }
    onDataLoaded?.(data);
  };

  useEffect(() => {
    const fetchIncorporationData = async () => {
      try {
        const response = await fetch(`/api/company/${companyId}/incorporation`);
        if (response.ok) {
          const data = await response.json();
          if (data.incorporation) {
            syncData(data.incorporation as Incorporation);
          } else {
            syncData(null);
          }
        }
      } catch (error) {
        console.error('Failed to fetch incorporation data', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIncorporationData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const url = formData.id
        ? `/api/company/${companyId}/incorporation/${formData.id}`
        : `/api/company/${companyId}/incorporation`;
      const method = formData.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        syncData(data.incorporation as Incorporation);
        setActiveStep((prevActiveStep) =>
          isSubmitted ? steps.length : Math.min(prevActiveStep + 1, steps.length),
        );
      } else {
        const errorText = await response.text();
        console.error(`Failed to save incorporation data: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Failed to save incorporation data', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = () => {
    if (isSubmitted) {
      return;
    }

    if (activeStep === steps.length - 1) {
      handleSave();
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    if (isSubmitted) {
      return;
    }
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleFormChange = (field: keyof Incorporation, value: FormFieldValue) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedFormChange = (
    model: 'businessAddress' | 'companyDetails' | 'attestation',
    field: string,
    value: FormFieldValue
  ) => {
    setFormData((prev) => {
      const previousValue = (prev[model] as Record<string, FormFieldValue> | undefined) ?? {};

      return {
        ...prev,
        [model]: {
          ...previousValue,
          [field]: value,
        },
      } as Partial<Incorporation>;
    });
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <BusinessInformationForm
            formData={formData}
            onFormChange={handleFormChange}
          />
        );
      case 1:
        return (
          <BusinessAddressForm
            formData={formData.businessAddress || {}}
            onFormChange={(field, value) =>
              handleNestedFormChange('businessAddress', field, value)
            }
          />
        );
      case 2:
        return (
          <CompanyDetailsForm
            formData={formData.companyDetails || {}}
            onFormChange={(field, value) =>
              handleNestedFormChange('companyDetails', field, value)
            }
          />
        );
      case 3:
        return (
          <AttestationForm
            formData={formData.attestation || {}}
            onFormChange={(field, value) =>
              handleNestedFormChange('attestation', field, value)
            }
          />
        );
      default:
        return <Typography>Unknown step</Typography>;
    }
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <Stepper activeStep={Math.min(activeStep, steps.length)} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Box sx={{ mt: 4 }}>
        {activeStep === steps.length || isSubmitted ? (
          <Box>
            <Typography sx={{ mt: 2, mb: 1 }}>
              All steps completed — your incorporation packet is ready.
            </Typography>
            {formData.submittedAt && (
              <Typography variant="body2" color="text.secondary">
                Submitted on {new Date(formData.submittedAt).toLocaleDateString()}. A FormaNew specialist will follow up with
                next steps shortly.
              </Typography>
            )}
          </Box>
        ) : (
          <Box>
            {getStepContent(activeStep)}
            <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
              <Button
                color="inherit"
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ mr: 1 }}
              >
                Back
              </Button>
              <Box sx={{ flex: '1 1 auto' }} />
              <Button onClick={handleNext} disabled={isSaving}>
                {isSaving ? (
                  <CircularProgress size={24} />
                ) : activeStep === steps.length - 1 ? (
                  'Finish'
                ) : (
                  'Next'
                )}
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default IncorporationForm;
