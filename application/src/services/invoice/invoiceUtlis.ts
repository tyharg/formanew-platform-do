import { InvoiceData } from './invoiceService';
import { User } from 'types';

/**
 * Generates a unique invoice number with format: INV-YYYYMMDD-XXXX
 * where XXXX is a random 4-digit number
 */
export function generateInvoiceNumber(): string {
  const date = new Date();
  const dateStr = date.getFullYear().toString() + 
    (date.getMonth() + 1).toString().padStart(2, '0') + 
    date.getDate().toString().padStart(2, '0');
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-${dateStr}-${randomNum}`;
}

/**
 * Prepares invoice data from user and plan information
 */
export function prepareInvoiceData(
  user: User,
  plan: {
    name: string;
    description: string;
    amount: number;
    interval: string | null;
    features: string[];
    priceId: string;
  },
  subscriptionId: string
): InvoiceData {
  return {
    customerName: user.name,
    customerEmail: user.email,
    planName: plan.name,
    planDescription: plan.description,
    amount: plan.amount,
    interval: plan.interval,
    features: plan.features,
    subscriptionId,
    invoiceDate: new Date(),
    invoiceNumber: generateInvoiceNumber(),
  };
} 