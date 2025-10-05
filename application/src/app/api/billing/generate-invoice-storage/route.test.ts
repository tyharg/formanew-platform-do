import { NextRequest } from 'next/server';
import { POST as generateInvoiceStorageHandler } from './route';
import { createInvoiceService } from 'services/invoice/invoiceFactory';
import { createDatabaseService } from 'services/database/databaseFactory';
import { createBillingService } from 'services/billing/billingFactory';
import { createStorageService } from 'services/storage/storageFactory';
import { pdfService } from 'services/pdf/pdfService';

// Mock all services
jest.mock('services/invoice/invoiceFactory');
jest.mock('services/database/databaseFactory');
jest.mock('services/billing/billingFactory');
jest.mock('services/storage/storageFactory');
jest.mock('services/pdf/pdfService');

const mockCreateInvoiceService = createInvoiceService as jest.MockedFunction<typeof createInvoiceService>;
const mockCreateDatabaseService = createDatabaseService as jest.MockedFunction<typeof createDatabaseService>;
const mockCreateBillingService = createBillingService as jest.MockedFunction<typeof createBillingService>;
const mockCreateStorageService = createStorageService as jest.MockedFunction<typeof createStorageService>;

describe('generateInvoiceStorageHandler', () => {
  const mockUser = {
    id: 'user-123',
    role: 'user',
    email: 'test@example.com'
  };

  const mockRequest = new NextRequest('http://localhost:3000/api/billing/generate-invoice-storage', {
    method: 'POST'
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate and upload invoice successfully', async () => {
    // Mock database service
    const mockDb = {
      user: {
        findById: jest.fn().mockResolvedValue({
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com'
        })
      },
      subscription: {
        findByUserId: jest.fn().mockResolvedValue([{
          id: 'sub-123',
          plan: 'PRO',
          status: 'active'
        }]),
        update: jest.fn(),
        create: jest.fn()
      }
    };
    mockCreateDatabaseService.mockResolvedValue(mockDb as unknown);

    // Mock billing service
    const mockBillingService = {
      getProducts: jest.fn().mockResolvedValue([{
        priceId: 'price_pro',
        name: 'Pro Plan',
        amount: 12.00
      }]),
      checkConfiguration: jest.fn().mockResolvedValue({
        configured: true,
        connected: true
      }),
      listCustomer: jest.fn().mockResolvedValue([]),
      createCustomer: jest.fn().mockResolvedValue({ id: 'cus_123' }),
      createSubscription: jest.fn()
    };
    mockCreateBillingService.mockResolvedValue(mockBillingService as unknown);

    // Mock invoice service
    const mockInvoiceService = {
      generateInvoice: jest.fn().mockResolvedValue({
        html: '<html>Invoice HTML</html>',
        text: 'Invoice text',
        subject: 'Invoice Subject'
      }),
      checkConfiguration: jest.fn().mockResolvedValue({
        configured: true,
        connected: true
      })
    };
    mockCreateInvoiceService.mockResolvedValue(mockInvoiceService as unknown);

    // Mock storage service
    const mockStorageService = {
      uploadFile: jest.fn().mockResolvedValue('invoice.pdf'),
      getFileUrl: jest.fn().mockResolvedValue('https://example.com/invoice.pdf'),
      checkConfiguration: jest.fn().mockResolvedValue({
        configured: true,
        connected: true
      })
    };
    mockCreateStorageService.mockResolvedValue(mockStorageService as unknown);

    // Mock PDF service
    (pdfService.isAvailable as jest.Mock).mockResolvedValue(true);
    (pdfService.generateInvoicePDF as jest.Mock).mockResolvedValue(Buffer.from('PDF content'));

    // Set environment variable
    process.env.STRIPE_PRO_PRICE_ID = 'price_pro';

    const response = await generateInvoiceStorageHandler(mockRequest, mockUser);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.invoiceNumber).toBeDefined();
    expect(data.planName).toBe('Pro Plan');
    expect(data.amount).toBe(12.00);
    expect(data.message).toBe('Invoice generated and stored successfully. Use the download button to access it.');
  });

  it('should return error when user not found', async () => {
    const mockDb = {
      user: {
        findById: jest.fn().mockResolvedValue(null)
      }
    };
    mockCreateDatabaseService.mockResolvedValue(mockDb as unknown);

    const response = await generateInvoiceStorageHandler(mockRequest, mockUser);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('User not found');
  });

  it('should return error when invoice service not configured', async () => {
    const mockDb = {
      user: {
        findById: jest.fn().mockResolvedValue({
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com'
        })
      },
      subscription: {
        findByUserId: jest.fn().mockResolvedValue([{
          id: 'sub-123',
          plan: 'PRO',
          status: 'active'
        }])
      }
    };
    mockCreateDatabaseService.mockResolvedValue(mockDb as unknown);

    const mockBillingService = {
      getProducts: jest.fn().mockResolvedValue([{
        priceId: 'price_pro',
        name: 'Pro Plan',
        amount: 12.00
      }])
    };
    mockCreateBillingService.mockResolvedValue(mockBillingService as unknown);

    const mockInvoiceService = {
      checkConfiguration: jest.fn().mockResolvedValue({
        configured: false,
        connected: false
      })
    };
    mockCreateInvoiceService.mockResolvedValue(mockInvoiceService as unknown);

    process.env.STRIPE_PRO_PRICE_ID = 'price_pro';

    const response = await generateInvoiceStorageHandler(mockRequest, mockUser);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Invoice service not configured or connected');
  });

  it('should return error when storage service not configured', async () => {
    const mockDb = {
      user: {
        findById: jest.fn().mockResolvedValue({
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com'
        })
      },
      subscription: {
        findByUserId: jest.fn().mockResolvedValue([{
          id: 'sub-123',
          plan: 'PRO',
          status: 'active'
        }])
      }
    };
    mockCreateDatabaseService.mockResolvedValue(mockDb as unknown);

    const mockBillingService = {
      getProducts: jest.fn().mockResolvedValue([{
        priceId: 'price_pro',
        name: 'Pro Plan',
        amount: 12.00
      }])
    };
    mockCreateBillingService.mockResolvedValue(mockBillingService as unknown);

    const mockInvoiceService = {
      generateInvoice: jest.fn().mockResolvedValue({
        html: '<html>Invoice HTML</html>',
        text: 'Invoice text',
        subject: 'Invoice Subject'
      }),
      checkConfiguration: jest.fn().mockResolvedValue({
        configured: true,
        connected: true
      })
    };
    mockCreateInvoiceService.mockResolvedValue(mockInvoiceService as unknown);

    const mockStorageService = {
      checkConfiguration: jest.fn().mockResolvedValue({
        configured: false,
        connected: false
      })
    };
    mockCreateStorageService.mockResolvedValue(mockStorageService as unknown);

    (pdfService.isAvailable as jest.Mock).mockResolvedValue(true);
    (pdfService.generateInvoicePDF as jest.Mock).mockResolvedValue(Buffer.from('PDF content'));

    process.env.STRIPE_PRO_PRICE_ID = 'price_pro';

    const response = await generateInvoiceStorageHandler(mockRequest, mockUser);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Storage service not configured or connected');
  });
}); 