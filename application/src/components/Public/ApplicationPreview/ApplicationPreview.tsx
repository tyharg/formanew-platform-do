import React from 'react';
import { Typography, Box, Container, Stack, Card, Button, Chip, Divider } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TimelineIcon from '@mui/icons-material/Timeline';
import TaskIcon from '@mui/icons-material/Task';
import { DIMENSIONS } from 'constants/landing';
import BrandLogo from 'components/Common/BrandLogo/BrandLogo';

/**
 * ApplicationPreview component
 */
const ApplicationPreview = () => {
  return (
    <Box component="section" py={DIMENSIONS.spacing.section} bgcolor="background.default" aria-labelledby="preview-title">
      <Container maxWidth="lg">
        <Stack spacing={DIMENSIONS.spacing.card} textAlign="center">
          <Box component="header" className="sr-only">
            <Typography variant="h3" component="h3" id="preview-title">
              Application Preview
            </Typography>
          </Box>
          <Box sx={{ 
            position: 'relative',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <Box 
              component="figure" 
              aria-label="FormaNew application interface mockup"
              sx={{ 
                bgcolor: 'background.paper', 
                borderRadius: 3, 
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                maxWidth: '100%',
                width: '100%',
                margin: 0
              }}>
              {/* Mock application screenshot */}
              <Box sx={{
                bgcolor: '#1a1a1a',
                p: DIMENSIONS.spacing.stack,
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                gap: DIMENSIONS.spacing.small
              }}>
                <Box sx={{ width: DIMENSIONS.terminalDot.width, height: DIMENSIONS.terminalDot.height, borderRadius: '50%', bgcolor: '#ff5f56' }} />
                <Box sx={{ width: DIMENSIONS.terminalDot.width, height: DIMENSIONS.terminalDot.height, borderRadius: '50%', bgcolor: '#ffbd2e' }} />
                <Box sx={{ width: DIMENSIONS.terminalDot.width, height: DIMENSIONS.terminalDot.height, borderRadius: '50%', bgcolor: '#27ca3f' }} />
                <Typography variant="body2" sx={{ color: 'grey.400', ml: 2, fontFamily: 'monospace' }}>
                  FormaNew
                </Typography>
              </Box>
              
              <Box sx={{
                display: 'flex',
                minHeight: DIMENSIONS.layout.minHeight,
                bgcolor: '#f8f9fa'
              }}>
                {/* Sidebar */}
                <Box sx={{
                  width: DIMENSIONS.layout.sidebarWidth,
                  bgcolor: 'white',
                  borderRight: '1px solid',
                  borderColor: 'divider',
                  p: DIMENSIONS.spacing.small
                }}>
                  <Stack spacing={DIMENSIONS.spacing.small}>
                    <BrandLogo
                      size={28}
                      href={null}
                      textVariant="subtitle1"
                      textColor="primary.main"
                    />
                    <Box sx={{ height: 1, bgcolor: 'divider', my: 1 }} />
                    {[ 'Dashboard', 'Contracts', 'Filings', 'Finance', 'Documents', 'Client Portal', 'Settings' ].map(
                      (item, index) => (
                        <Typography
                          key={item}
                          variant="body2"
                          sx={{
                            color: index === 0 ? 'primary.main' : 'text.secondary',
                            fontWeight: index === 0 ? 600 : 500,
                          }}
                        >
                          {item}
                        </Typography>
                      )
                    )}
                  </Stack>
                </Box>
                
                {/* Main content */}
                <Box sx={{ flex: 1, p: DIMENSIONS.spacing.stack }}>
                  <Stack spacing={DIMENSIONS.spacing.stack}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Typography variant="h5" fontWeight="bold">
                          Company Dashboard
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Daily briefing for FormaNew Labs LLC
                        </Typography>
                      </div>
                      <Button variant="contained" size="small" sx={{ textTransform: 'none' }}>
                        New contract
                      </Button>
                    </Box>

                    {/* KPI cards */}
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: 'repeat(1, 1fr)',
                          sm: 'repeat(2, 1fr)',
                          md: 'repeat(4, 1fr)',
                        },
                        gap: DIMENSIONS.spacing.small,
                      }}
                    >
                      {[
                        {
                          label: 'Monthly revenue',
                          value: '$82,400',
                          delta: '+18.3% MoM',
                          icon: <AssessmentIcon fontSize="small" />,
                        },
                        {
                          label: 'Active contracts',
                          value: '27',
                          delta: '4 expiring soon',
                          icon: <BusinessCenterIcon fontSize="small" />,
                        },
                        {
                          label: 'Pending signatures',
                          value: '6',
                          delta: 'Average turnaround 2.1 days',
                          icon: <PendingActionsIcon fontSize="small" />,
                        },
                        {
                          label: 'Cash on hand',
                          value: '$312k',
                          delta: 'Next payout: Aug 28',
                          icon: <AccountBalanceWalletIcon fontSize="small" />,
                        },
                      ].map((metric) => (
                        <Card key={metric.label} sx={{ p: DIMENSIONS.spacing.small }}>
                          <Stack spacing={1}>
                            <Chip
                              icon={metric.icon}
                              label={metric.label}
                              size="small"
                              sx={{ alignSelf: 'flex-start', textTransform: 'uppercase', fontSize: 10 }}
                            />
                            <Typography variant="h5" fontWeight="bold">
                              {metric.value}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {metric.delta}
                            </Typography>
                          </Stack>
                        </Card>
                      ))}
                    </Box>

                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: '1fr',
                          md: '2fr 1.2fr',
                        },
                        gap: DIMENSIONS.spacing.stack,
                      }}
                    >
                      <Card sx={{ p: DIMENSIONS.spacing.stack }}>
                        <Stack spacing={DIMENSIONS.spacing.small}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <TimelineIcon fontSize="small" color="primary" />
                            <Typography variant="subtitle1" fontWeight="bold">
                              Revenue pace
                            </Typography>
                          </Stack>
                          <Typography variant="body2" color="text.secondary">
                            Projected run rate $960k • Stripe processing fees $2.1k this month
                          </Typography>
                          <Box
                            sx={{
                              mt: DIMENSIONS.spacing.small,
                              height: 140,
                              borderRadius: 2,
                              background:
                                'linear-gradient(135deg, rgba(59,130,246,0.18) 0%, rgba(16,185,129,0.22) 100%)',
                              position: 'relative',
                              overflow: 'hidden',
                            }}
                          >
                            <Box
                              sx={{
                                position: 'absolute',
                                inset: 16,
                                borderRadius: 2,
                                border: '1px solid rgba(255,255,255,0.4)',
                                backdropFilter: 'blur(6px)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'common.white',
                                fontSize: 13,
                                fontWeight: 600,
                              }}
                            >
                              Forecast trend ↑ 12% QoQ
                            </Box>
                          </Box>
                        </Stack>
                      </Card>

                      <Card sx={{ p: DIMENSIONS.spacing.stack }}>
                        <Stack spacing={DIMENSIONS.spacing.small}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <TaskIcon fontSize="small" color="primary" />
                            <Typography variant="subtitle1" fontWeight="bold">
                              Compliance autopilot
                            </Typography>
                          </Stack>
                          <Divider />
                          {[
                            {
                              title: 'Wyoming annual report',
                              due: 'Due in 6 days',
                              status: 'Ready to file',
                            },
                            {
                              title: 'Registered agent renewal',
                              due: 'Scheduled Sep 30',
                              status: 'Auto-renew enabled',
                            },
                            {
                              title: 'Mercury beneficial ownership update',
                              due: 'Completed Aug 12',
                              status: 'Filed',
                            },
                          ].map((item) => (
                            <Box key={item.title} sx={{ py: 1 }}>
                              <Typography variant="body2" fontWeight={600}>
                                {item.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {item.due} • {item.status}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      </Card>
                    </Box>

                    <Card sx={{ p: DIMENSIONS.spacing.stack }}>
                      <Stack spacing={DIMENSIONS.spacing.small}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Contracts moving today
                        </Typography>
                        <Divider />
                        <Box
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                              xs: 'repeat(1, 1fr)',
                              sm: 'repeat(2, 1fr)',
                            },
                            gap: DIMENSIONS.spacing.small,
                          }}
                        >
                          {[
                            {
                              title: 'CrowdGen Labeling SOW',
                              stage: 'Awaiting counter-signature',
                              value: '$48,000 • Net 30',
                            },
                            {
                              title: 'Mercury Treasury Advisory',
                              stage: 'Legal review complete',
                              value: '$7,500 monthly retainer',
                            },
                            {
                              title: 'Oak Cliff Implementation',
                              stage: 'Kickoff tomorrow, 10:00 AM',
                              value: 'Milestone 1: $12,500',
                            },
                            {
                              title: 'DataAnnotation Expert Bench',
                              stage: 'Updated scope shared with client',
                              value: 'Task order pending approval',
                            },
                          ].map((item) => (
                            <Box
                              key={item.title}
                              sx={{
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2,
                                p: DIMENSIONS.spacing.small,
                                backgroundColor: 'white',
                              }}
                            >
                              <Typography variant="body2" fontWeight={600}>
                                {item.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {item.stage}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                                {item.value}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Stack>
                    </Card>
                  </Stack>
                </Box>
              </Box>
            </Box>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default ApplicationPreview;
