"use client";

import React, { useState } from "react";
import { Box, Stack, TextField, Typography } from '@mui/material';

interface BusinessAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

const BusinessAddressForm: React.FC = () => {
  const [address, setAddress] = useState<BusinessAddress>({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress((prevAddress) => ({
      ...prevAddress,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Business Address:", address);
    // Here you would typically handle the form submission,
    // e.g., send the data to an API endpoint.
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h5" gutterBottom>
        Business Address
      </Typography>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            name="street"
            label="Street Address"
            value={address.street}
            onChange={handleChange}
            fullWidth
            required
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              name="city"
              label="City"
              value={address.city}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              name="state"
              label="State / Province"
              value={address.state}
              onChange={handleChange}
              fullWidth
              required
            />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              name="zipCode"
              label="ZIP / Postal Code"
              value={address.zipCode}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              name="country"
              label="Country"
              value={address.country}
              onChange={handleChange}
              fullWidth
              required
            />
          </Stack>
        </Stack>
        <Box sx={{ mt: 3 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
          >
            Submit
          </Button>
        </Box>
      </form>
    </Stack>
  );
};

export default BusinessAddressForm;
