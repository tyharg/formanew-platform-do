'use client';

import { Box } from '@mui/material';
import React, { useEffect, useRef } from 'react';

type TurnstileChallengeProps = {
  siteKey: string;
  onToken: (token: string | null) => void;
  resetSignal: number;
};

type TurnstileRenderOptions = {
  sitekey: string;
  callback: (token: string) => void;
  'error-callback'?: () => void;
  'expired-callback'?: () => void;
};

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: TurnstileRenderOptions) => string;
      reset: (widgetId: string) => void;
      remove?: (widgetId: string | HTMLElement) => void;
    };
  }
}

/**
 * Lightweight wrapper around the Cloudflare Turnstile widget.
 * Handles script loading and refresh/reset lifecycle for the login page.
 */
const TurnstileChallenge: React.FC<TurnstileChallengeProps> = ({
  siteKey,
  onToken,
  resetSignal,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const renderWidget = () => {
    if (!window.turnstile || !containerRef.current || widgetIdRef.current) {
      return;
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: (token) => onToken(token),
      'error-callback': () => onToken(null),
      'expired-callback': () => {
        onToken(null);
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current);
        }
      },
    });
  };

  useEffect(() => {
    if (!siteKey) {
      return;
    }

    const existingScript = document.getElementById('turnstile-script') as HTMLScriptElement | null;
    const handleScriptLoad = () => renderWidget();

    if (window.turnstile) {
      renderWidget();
      return;
    }

    if (existingScript) {
      existingScript.addEventListener('load', handleScriptLoad);
    } else {
      const script = document.createElement('script');
      script.id = 'turnstile-script';
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      script.addEventListener('load', handleScriptLoad);
      document.head.appendChild(script);
    }

    return () => {
      const script = document.getElementById('turnstile-script');
      script?.removeEventListener('load', handleScriptLoad);

      if (widgetIdRef.current && window.turnstile?.remove) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey]);

  useEffect(() => {
    if (resetSignal > 0 && widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  }, [resetSignal]);

  if (!siteKey) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div ref={containerRef} />
    </Box>
  );
};

export default TurnstileChallenge;
