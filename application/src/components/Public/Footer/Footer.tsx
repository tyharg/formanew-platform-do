import React from 'react';
import Link from 'next/link';
import { Box, Container, Typography, Stack, useTheme } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import LaunchIcon from '@mui/icons-material/Launch';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import ArticleIcon from '@mui/icons-material/Article';
import BoltIcon from '@mui/icons-material/Bolt';
import SchoolIcon from '@mui/icons-material/School';
import { URLS, DIMENSIONS } from 'constants/landing';

const footerSections = [
  {
    title: 'Platform',
    links: [
      { label: 'Pricing', href: '/pricing', icon: <LaunchIcon sx={{ fontSize: DIMENSIONS.iconSize.small }} /> },
      { label: 'Product tour', href: '/dashboard', icon: <BoltIcon sx={{ fontSize: DIMENSIONS.iconSize.small }} /> },
      { label: 'GitHub Repository', href: URLS.githubRepo, icon: <GitHubIcon sx={{ fontSize: DIMENSIONS.iconSize.small }} /> },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Launch guide', href: URLS.launchGuide, icon: <MenuBookIcon sx={{ fontSize: DIMENSIONS.iconSize.small }} /> },
      { label: 'Knowledge base', href: URLS.documentation, icon: <SchoolIcon sx={{ fontSize: DIMENSIONS.iconSize.small }} /> },
      { label: 'Blog', href: URLS.blog, icon: <ArticleIcon sx={{ fontSize: DIMENSIONS.iconSize.small }} /> },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'Partner network', href: URLS.partnerNetwork, icon: <Diversity3Icon sx={{ fontSize: DIMENSIONS.iconSize.small }} /> },
      { label: 'Help center', href: URLS.helpCenter, icon: <HeadsetMicIcon sx={{ fontSize: DIMENSIONS.iconSize.small }} /> },
      { label: 'Status page', href: URLS.status, icon: <LaunchIcon sx={{ fontSize: DIMENSIONS.iconSize.small }} /> },
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
            © 2025 FormaNew. Purpose-built for modern founders building the next wave of digital companies.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
