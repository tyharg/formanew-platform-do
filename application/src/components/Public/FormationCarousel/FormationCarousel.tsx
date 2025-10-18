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
  'Incorporation filing',
  'Compliance automation',
  'Financial launchpad',
  'Client onboarding',
  'Growth partnerships',
];

const stepMessages: Record<string, { headline: string; description: string }> = {
  'Incorporation filing': {
    headline: 'Guided formation for modern operators',
    description:
      'Reserve your name, draft articles, and route signatures with a guided checklist that keeps every filing step on schedule.',
  },
  'Compliance automation': {
    headline: 'Built-in compliance without the busywork',
    description:
      'Automated EIN filing, annual report reminders, and registered agent coordination keep your LLC in good standing year-round.',
  },
  'Financial launchpad': {
    headline: 'Track every dollar from quote to payout',
    description:
      'Send invoices, reconcile expenses, and monitor cash flow inside one dashboard that’s tuned for freelancers and studios.',
  },
  'Client onboarding': {
    headline: 'Deliver a polished client experience day one',
    description:
      'Share branded portals, secure payments, and status updates that make collaborating with you effortless for every client.',
  },
  'Growth partnerships': {
    headline: 'Scale with curated partners and perks',
    description:
      'Unlock partner benefits, coaching sessions, and curated capital introductions tailored to your next stage of growth.',
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
              LLC + MORE
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
                Every milestone syncs to your FormaNew dashboard so filings, finances, and client delivery stay in lockstep.
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
