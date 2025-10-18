'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Step,
  StepLabel,
  Stepper,
  Typography,
  useTheme,
} from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { DIMENSIONS } from 'constants/landing';

const formationSteps = [
  'Formation filing',
  'Tax & compliance',
  'Financial command',
  'Client experience',
  'Growth network',
];

const stepMessages: Record<string, { headline: string; description: string }> = {
  'Formation filing': {
    headline: 'Form your entity with guided filings',
    description:
      'Reserve your name, prepare state packets, and submit signatures with a filing assistant that tracks every requirement.',
  },
  'Tax & compliance': {
    headline: 'Automate EIN, tax IDs, and compliance tasks',
    description:
      'EIN requests, registered agent docs, and annual reports stay coordinated with smart reminders and digital records.',
  },
  'Financial command': {
    headline: 'Activate banking, payouts, and budgeting',
    description:
      'Connect banking partners, sync Stripe payouts, and monitor cash flow with contract revenue forecasts and tax reserves.',
  },
  'Client experience': {
    headline: 'Deliver a branded workspace for every client',
    description:
      'Share proposals, collect signatures, and accept payments through a secure, white-labeled portal your clients will love.',
  },
  'Growth network': {
    headline: 'Unlock partners, perks, and expansion capital',
    description:
      'Tap curated benefits, expert operators, and growth programs that help your future-of-work business scale faster.',
  },
};

const STEP_ADVANCE_INTERVAL = 3200;

const FormationCarousel = () => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [messageMinHeight, setMessageMinHeight] = useState(0);
  const [cardMinSize, setCardMinSize] = useState({ width: 0, height: 0 });
  const [isMeasured, setIsMeasured] = useState(false);
  const hiddenMeasurementsRef = useRef<HTMLDivElement | null>(null);

  const measureSlides = useCallback(() => {
    const container = hiddenMeasurementsRef.current;
    if (!container) {
      return;
    }

    const cardElements = Array.from(
      container.querySelectorAll<HTMLElement>('[data-measure-card="true"]'),
    );

    if (!cardElements.length) {
      return;
    }

    let maxCardHeight = 0;
    let maxCardWidth = 0;
    let maxMessageHeight = 0;

    cardElements.forEach((card) => {
      const { height, width } = card.getBoundingClientRect();
      maxCardHeight = Math.max(maxCardHeight, height);
      maxCardWidth = Math.max(maxCardWidth, width);

      const messageElement = card.querySelector<HTMLElement>('[data-measure-message="true"]');
      if (messageElement) {
        const { height: messageHeight } = messageElement.getBoundingClientRect();
        maxMessageHeight = Math.max(maxMessageHeight, messageHeight);
      }
    });

    if (maxCardHeight > 0) {
      setCardMinSize((prev) =>
        prev.height === maxCardHeight && prev.width === maxCardWidth
          ? prev
          : { width: maxCardWidth, height: maxCardHeight },
      );
      setMessageMinHeight((prev) => (prev === maxMessageHeight ? prev : maxMessageHeight));
      setIsMeasured(true);
    }
  }, []);

  useEffect(() => {
    measureSlides();
    window.addEventListener('resize', measureSlides);

    return () => window.removeEventListener('resize', measureSlides);
  }, [measureSlides]);

  useEffect(() => {
    if (!isMeasured) {
      return;
    }

    const interval = setInterval(() => {
      setActiveStep((prevStep) => (prevStep + 1) % formationSteps.length);
    }, STEP_ADVANCE_INTERVAL);

    return () => clearInterval(interval);
  }, [isMeasured]);

  const renderCardContent = (
    step: string,
    stepIndex: number,
    options?: { constrain?: boolean; measure?: boolean },
  ) => {
    const message = stepMessages[step];
    const shouldConstrainCard =
      Boolean(options?.constrain) && isMeasured && cardMinSize.height > 0 && cardMinSize.width > 0;
    const shouldConstrainMessage =
      Boolean(options?.constrain) && isMeasured && messageMinHeight > 0;

    return (
      <Box
        data-measure-card={options?.measure ? 'true' : undefined}
        sx={{
          bgcolor: 'white',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          height: options?.measure ? 'auto' : '100%',
          minHeight: shouldConstrainCard ? cardMinSize.height : undefined,
          minWidth: shouldConstrainCard ? cardMinSize.width : undefined,
        }}
      >
        <Box
          sx={{
            bgcolor: '#f5f5f5',
            px: 2,
            py: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Box
              sx={{
                width: DIMENSIONS.terminalDot.width,
                height: DIMENSIONS.terminalDot.height,
                borderRadius: '50%',
                bgcolor: '#ff5f56',
              }}
            />
            <Box
              sx={{
                width: DIMENSIONS.terminalDot.width,
                height: DIMENSIONS.terminalDot.height,
                borderRadius: '50%',
                bgcolor: '#ffbd2e',
              }}
            />
            <Box
              sx={{
                width: DIMENSIONS.terminalDot.width,
                height: DIMENSIONS.terminalDot.height,
                borderRadius: '50%',
                bgcolor: '#27ca3f',
              }}
            />
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
            Company journey timeline
          </Typography>
        </Box>

        <Box
          sx={{
            p: { xs: DIMENSIONS.spacing.small, md: DIMENSIONS.spacing.small },
            display: 'flex',
            flexDirection: 'column',
            gap: DIMENSIONS.spacing.stack,
            height: options?.measure ? 'auto' : '100%',
          }}
        >
          <Box
            data-measure-message={options?.measure ? 'true' : undefined}
            sx={{
              minHeight: shouldConstrainMessage ? messageMinHeight : undefined,
            }}
          >
            <Typography variant="overline" color="primary.main" sx={{ letterSpacing: 1.5 }}>
              FORMATION TIMELINE
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, mt: 0.5 }}>
              {message.headline}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {message.description}
            </Typography>
          </Box>

          <Stepper activeStep={stepIndex} alternativeLabel>
            {formationSteps.map((label) => (
              <Step key={label}>
                <StepLabel
                  StepIconProps={{
                    sx: {
                      color: (theme) =>
                        label === step ? theme.palette.primary.main : theme.palette.grey[400],
                    },
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: label === step ? 600 : 400,
                      color:
                        label === step
                          ? theme.palette.text.primary
                          : theme.palette.text.secondary,
                    }}
                  >
                    {label}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box
            sx={{
              bgcolor: theme.palette.grey[50],
              borderRadius: 2,
              border: '1px solid',
              borderColor: theme.palette.grey[200],
              p: DIMENSIONS.spacing.tiny,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PlayCircleOutlineIcon color="primary" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                FormaNew keeps incorporation, revenue operations, and client delivery in one flow.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ flexGrow: 1 }} />
        </Box>
      </Box>
    );
  };

  const currentStep = useMemo(() => formationSteps[activeStep], [activeStep]);

  return (
    <Box
      sx={{
        order: { xs: 1, lg: 2 },
        width: { xs: '100%', lg: DIMENSIONS.layout.terminalWidth },
        maxWidth: '100%',
        flexShrink: 0,
        position: 'relative',
      }}
      aria-label=""
    >
      {renderCardContent(currentStep, activeStep, { constrain: true })}

      <Box
        ref={hiddenMeasurementsRef}
        aria-hidden
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          visibility: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {formationSteps.map((step, index) =>
          renderCardContent(step, index, { measure: true }),
        )}
      </Box>
    </Box>
  );
};

export default FormationCarousel;
