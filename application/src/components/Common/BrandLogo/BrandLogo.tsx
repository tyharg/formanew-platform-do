'use client';

import React from 'react';
import Link from 'next/link';
import { Box, Stack, Typography } from '@mui/material';
import type { TypographyProps } from '@mui/material/Typography';

interface BrandLogoProps {
  size?: number;
  showWordmark?: boolean;
  href?: string | null;
  textVariant?: TypographyProps['variant'];
  textColor?: string;
  direction?: 'row' | 'column';
  spacing?: number;
  sx?: React.ComponentProps<typeof Box>['sx'];
}

const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 36,
  showWordmark = true,
  href = '/',
  textVariant = 'h6',
  textColor = 'primary.main',
  direction = 'row',
  spacing = 1,
  sx,
}) => {
  const content = (
    <Stack direction={direction} spacing={spacing} alignItems="center" sx={sx}>
      <Box
        component="img"
        src="/logo.svg"
        alt="FormaNew logo"
        sx={{ width: size, height: size, flexShrink: 0 }}
      />
      {showWordmark ? (
        <Typography
          variant={textVariant}
          fontWeight={700}
          color={textColor}
          sx={{ lineHeight: 1, whiteSpace: 'nowrap' }}
        >
          FormaNew
        </Typography>
      ) : null}
    </Stack>
  );

  if (!href) {
    return content;
  }

  return (
    <Box
      component={Link}
      href={href}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        textDecoration: 'none',
      }}
    >
      {content}
    </Box>
  );
};

export default BrandLogo;
