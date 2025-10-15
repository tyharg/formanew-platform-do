'use client';

import React, { useState } from 'react';

interface ProductCard {
  id: string;
  name: string;
  description: string;
  priceId: string;
  unitAmount: number;
  currency: string;
}

interface Props {
  accountId: string;
  products: ProductCard[];
  note: string;
}

export default function ConnectStorefrontClient({ accountId, products, note }: Props) {
  const [message, setMessage] = useState<string | null>(null);

  const formatPrice = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    });
    return formatter.format(amount / 100);
  };

  const handleCheckout = async (priceId: string) => {
    setMessage(null);
    try {
      const response = await fetch(`/api/connect/accounts/${accountId}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Unable to create Checkout session.');
      }
      window.location.href = payload.url;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Checkout failed to initialise.');
    }
  };

  return (
    <main style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>Connected Storefront</h1>
      <p style={{ marginBottom: '1.5rem', color: '#555' }}>{note}</p>
      <p style={{ marginBottom: '2rem' }}>
        Listing products for <code>{accountId}</code>. Prices and inventory are retrieved directly from the connected
        account using the <code>stripeAccount</code> header.
      </p>

      {message && (
        <div style={{ marginBottom: '1.5rem', background: '#fdecea', padding: '0.75rem', borderRadius: '6px', border: '1px solid #f0b1a1' }}>
          {message}
        </div>
      )}

      {products.length === 0 ? (
        <div style={{ background: '#f6f8fa', padding: '1.5rem', borderRadius: '6px', textAlign: 'center' }}>
          No products found on this connected account. Create one from the demo dashboard to see it here.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {products.map((product) => (
            <article key={product.id} style={{ border: '1px solid #d0d7de', borderRadius: '8px', padding: '1.25rem', background: '#fff' }}>
              <h2 style={{ marginTop: 0 }}>{product.name}</h2>
              <p style={{ minHeight: '3rem' }}>{product.description}</p>
              <p style={{ fontWeight: 600, fontSize: '1.15rem', marginBottom: '1rem' }}>
                {formatPrice(product.unitAmount, product.currency)}
              </p>
              <button
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.6rem 1.1rem',
                  borderRadius: '6px',
                  border: '1px solid transparent',
                  backgroundColor: '#1976d2',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                onClick={() => handleCheckout(product.priceId)}
              >
                Buy now
              </button>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
