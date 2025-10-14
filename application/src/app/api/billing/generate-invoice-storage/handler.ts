import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS } from 'lib/api/http';
import { createInvoiceService } from 'services/invoice/invoiceFactory';
import { createDatabaseService } from 'services/database/databaseFactory';
import { createBillingService } from 'services/billing/billingFactory';
import { createStorageService } from 'services/storage/storageFactory';
import { prepareInvoiceData } from 'services/invoice/invoiceUtlis';
import { pdfService } from 'services/pdf/pdfService';
import { SubscriptionPlanEnum, SubscriptionStatusEnum } from 'types';

/**
 * Core handler for generating an invoice and uploading it to storage.
 */
export async function generateInvoiceStorageHandler(
  req: NextRequest,
  user: { id: string; role: string; email: string }
): Promise<Response> {
  try {
    const db = await createDatabaseService();
    const userDetails = await db.user.findById(user.id);

    if (!userDetails) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    let userSubscription = await db.subscription.findByUserId(user.id);

    if (!userSubscription || userSubscription.length === 0) {
      const billingService = await createBillingService();
      const billingConfig = await billingService.checkConfiguration();
      if (!billingConfig.configured || !billingConfig.connected) {
        return NextResponse.json(
          { error: 'Billing service not configured. Cannot create subscription.' },
          { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
        );
      }

      let customerId: string;
      const customers = await billingService.listCustomer(user.email);
      if (customers.length > 0) {
        customerId = customers[0].id;
      } else {
        const customer = await billingService.createCustomer(user.email, { userId: user.email });
        customerId = customer.id;
      }

      await billingService.createSubscription(customerId, SubscriptionPlanEnum.FREE);
      await db.subscription.create({
        customerId,
        plan: SubscriptionPlanEnum.FREE,
        status: SubscriptionStatusEnum.ACTIVE,
        userId: user.id,
      });

      userSubscription = await db.subscription.findByUserId(user.id);
    }

    const subscription = userSubscription[0];

    if (!subscription.plan) {
      await db.subscription.update(user.id, {
        plan: SubscriptionPlanEnum.FREE,
        status: SubscriptionStatusEnum.ACTIVE,
      });
      subscription.plan = SubscriptionPlanEnum.FREE;
    }

    const billingService = await createBillingService();
    const plans = await billingService.getProducts();

    let selectedPlan;
    if (subscription.plan === 'FREE') {
      selectedPlan = plans.find((plan) => plan.priceId === process.env.STRIPE_FREE_PRICE_ID);
    } else if (subscription.plan === 'PRO') {
      selectedPlan = plans.find((plan) => plan.priceId === process.env.STRIPE_PRO_PRICE_ID);
    }

    if (!selectedPlan) {
      return NextResponse.json(
        { error: 'Plan details not found' },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    const invoiceService = await createInvoiceService();
    const invoiceConfig = await invoiceService.checkConfiguration();

    if (!invoiceConfig.configured || !invoiceConfig.connected) {
      return NextResponse.json(
        { error: 'Invoice service not configured or connected' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    const storageService = await createStorageService();
    const storageConfig = await storageService.checkConfiguration();

    if (!storageConfig.configured || !storageConfig.connected) {
      return NextResponse.json(
        { error: 'Storage service not configured or connected' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    const invoiceData = prepareInvoiceData(userDetails, selectedPlan, subscription.id);
    const generatedInvoice = await invoiceService.generateInvoice(invoiceData);

    let pdfBuffer: Buffer | null = null;

    try {
      const pdfAvailable = await pdfService.isAvailable();

      if (pdfAvailable) {
        pdfBuffer = await pdfService.generateInvoicePDF(generatedInvoice.html);
      }
    } catch (pdfError) {
      console.error('PDF generation failed:', pdfError);
      return NextResponse.json(
        { error: 'Failed to generate PDF invoice' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    if (!pdfBuffer) {
      return NextResponse.json(
        { error: 'PDF generation failed' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    const fileName = `invoices/${user.id}/${invoiceData.invoiceNumber}.pdf`;
    const file = new File([pdfBuffer], `${invoiceData.invoiceNumber}.pdf`, {
      type: 'application/pdf',
    });

    await storageService.uploadFile(user.id, fileName, file, { ACL: 'private' });

    return NextResponse.json({
      success: true,
      invoiceNumber: invoiceData.invoiceNumber,
      planName: selectedPlan.name,
      amount: selectedPlan.amount,
      message: 'Invoice generated and stored successfully. Use the download button to access it.'
    });
  } catch (error) {
    console.error('Failed to generate and upload invoice:', error);
    return NextResponse.json(
      { error: 'Failed to generate and upload invoice' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
