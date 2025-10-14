import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, Alert, CircularProgress, Paper } from '@mui/material';
import StripeConnectSetup from './StripeConnectSetup';
import ProductCreationForm from './ProductCreationForm'; // Import the new form
import { Company, CompanyFinance } from '@/types'; 
import { getCompanyById, updateCompanyFinance } from '@/lib/mockDb'; // Use mock DB for company data

/**
 * Placeholder for fetching the current user's primary company ID.
 * In a real app, this would come from session/context/API.
 */
const MOCK_COMPANY_ID = 'comp_12345'; // Replace with actual logic

// Define the structure for the live Stripe Account status update
interface LiveAccountStatus {
  detailsSubmitted: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  requirementsDue: string[];
  requirementsDueSoon: string[];
}

/**
 * Component to display and manage Company Finance settings, primarily Stripe Connect.
 */
export default function CompanyFinanceSettings() {
  const [company, setCompany] = useState<Company | null>(null);
  const [finance, setFinance] = useState<CompanyFinance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch the live Stripe Account status
  const fetchLiveAccountStatus = useCallback(async (stripeAccountId: string): Promise<LiveAccountStatus> => {
    // This API call hits the backend route that calls stripe.accounts.retrieve(stripeAccountId)
    const response = await fetch(`/api/company/${MOCK_COMPANY_ID}/finance/stripe/status?accountId=${stripeAccountId}`);
    
    if (!response.ok) {
        throw new Error('Failed to retrieve live Stripe account status.');
    }
    
    const status = await response.json();
    return status;
  }, []);


  // Fetch company data and live Stripe status
  const fetchCompanyData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch local company data (mocked DB call)
      const fetchedCompany = await getCompanyById(MOCK_COMPANY_ID);
      
      if (!fetchedCompany) {
        throw new Error('Company profile not found.');
      }
      
      setCompany(fetchedCompany);
      let currentFinance = fetchedCompany.finance;

      if (currentFinance && currentFinance.stripeAccountId) {
        // 2. If Stripe Account exists, fetch live status from Stripe API
        const liveStatus = await fetchLiveAccountStatus(currentFinance.stripeAccountId);
        
        // 3. Update local finance state with live status (mocked DB update)
        // This ensures the UI reflects the current state of the Stripe account
        currentFinance = await updateCompanyFinance(MOCK_COMPANY_ID, liveStatus);
      }

      setFinance(currentFinance);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Could not load company finance details.');
    } finally {
      setIsLoading(false);
    }
  }, [fetchLiveAccountStatus]);

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

  // Check if the account is connected and enabled for charges
  const isReadyForProducts = finance?.stripeAccountId && finance.chargesEnabled;

  return (
    <Paper elevation={1} sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Company Finances
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage your payment processing and payout settings via Stripe Connect.
      </Typography>

      <StripeConnectSetup 
        finance={finance} 
        companyId={company.id}
        onRefresh={fetchCompanyData}
      />
      
      {/* Show Product Creation Form only if Stripe is connected and charges are enabled */}
      {isReadyForProducts && (
        <ProductCreationForm 
          companyId={company.id} 
          stripeAccountId={finance.stripeAccountId!} 
        />
      )}
    </Paper>
  );
}
