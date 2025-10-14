import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, Alert, CircularProgress, Paper } from '@mui/material';
import StripeConnectSetup from './StripeConnectSetup';
import { Company } from '@/types'; // Assuming types are imported via '@/types'

/**
 * Placeholder for fetching the current user's primary company ID.
 * In a real app, this would come from session/context/API.
 */
const MOCK_COMPANY_ID = 'comp_12345'; // Replace with actual logic

/**
 * Component to display and manage Company Finance settings, primarily Stripe Connect.
 */
export default function CompanyFinanceSettings() {
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock fetch function - replace with actual API call
  const fetchCompanyData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // In a real application, this API call would fetch the currently active company
      // and its associated finance object.
      const response = await fetch(`/api/company/${MOCK_COMPANY_ID}`); 
      
      if (!response.ok) {
        throw new Error('Failed to fetch company finance data.');
      }

      const  Company = await response.json();
      setCompany(data);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Could not load company finance details.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanyData();
  }, [fetchCompanyData]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  if (!company) {
    return (
      <Alert severity="info">
        No company profile found. Please create a company profile first.
      </Alert>
    );
  }

  return (
    <Paper elevation={1} sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Company Finances
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage your payment processing and payout settings via Stripe Connect.
      </Typography>

      <StripeConnectSetup 
        finance={company.finance || null} 
        companyId={company.id}
        onRefresh={fetchCompanyData}
      />
    </Paper>
  );
}
