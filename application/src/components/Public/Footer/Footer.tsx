import React from 'react';
import Link from 'next/link';
import { Box, Container, Typography, Stack, useTheme } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GavelIcon from '@mui/icons-material/Gavel';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import { URLS, DIMENSIONS } from 'constants/landing';

const footerSections = [
  {
    title: 'Product',
    links: [
      {
        label: 'Pricing',
        href: '/pricing',
        icon: <MonetizationOnIcon sx={{ fontSize: DIMENSIONS.iconSize.small }} />,
      },
      {
        label: 'Dashboard',
        href: '/dashboard',
        icon: <DashboardIcon sx={{ fontSize: DIMENSIONS.iconSize.small }} />,
      },
      {
        label: 'Incorporation',
        href: '/incorporation',
        icon: <GavelIcon sx={{ fontSize: DIMENSIONS.iconSize.small }} />,
      },
    ],
  },
  {
    title: 'Resources',
    links: [
      {
        label: 'Product Tour',
        href: '/connect-demo',
        icon: <PlayCircleOutlineIcon sx={{ fontSize: DIMENSIONS.iconSize.small }} />,
      },
      {
        label: 'System Status',
        href: '/system-status',
        icon: <MonitorHeartIcon sx={{ fontSize: DIMENSIONS.iconSize.small }} />,
      },
      {
        label: 'Support',
        href: 'mailto:support@formanew.com',
        icon: <SupportAgentIcon sx={{ fontSize: DIMENSIONS.iconSize.small }} />,
      },
    ],
  },
  {
    title: 'Community',
    links: [
      {
        label: 'GitHub',
        href: URLS.githubRepo,
        icon: <GitHubIcon sx={{ fontSize: DIMENSIONS.iconSize.small }} />,
      },
      {
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/company/formanew',
        icon: <LinkedInIcon sx={{ fontSize: DIMENSIONS.iconSize.small }} />,
      },
      {
        label: 'Twitter',
        href: 'https://twitter.com/FormaNewHQ',
        icon: <TwitterIcon sx={{ fontSize: DIMENSIONS.iconSize.small }} />,
      },
    ],
  },
];

/**
 * Footer of the application.
 * Displays sections with links organized by categories and copyright.
 */
export default function Footer() {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'background.paper',
        py: DIMENSIONS.spacing.card,
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: DIMENSIONS.spacing.container,
            mb: DIMENSIONS.spacing.container,
          }}
        >
          {footerSections.map((section) => (
            <Box key={section.title}>
              <Typography variant="h6" fontWeight={600} sx={{ color: 'text.primary', mb: DIMENSIONS.spacing.small }}>
                {section.title}
              </Typography>
              <Stack spacing={DIMENSIONS.spacing.tiny}>
                {section.links.map((link) => (
                  <Box key={link.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ color: 'text.secondary' }}>
                      {link.icon}
                    </Box>
                    <Typography
                      component={Link}
                      href={link.href}
                      target={link.href.startsWith('http') ? '_blank' : '_self'}
                      rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      sx={{
                        color: 'text.secondary',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        '&:hover': {
                          color: 'primary.main',
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      {link.label}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          ))}
        </Box>
        
        <Box sx={{ pt: DIMENSIONS.spacing.container, borderTop: `1px solid ${theme.palette.divider}`, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © 2025 FormaNew. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
