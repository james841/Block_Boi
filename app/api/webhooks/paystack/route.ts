import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * PAYSTACK WEBHOOK HANDLER
 * Receives real-time payment notifications from Paystack
 * Use this to update order status automatically
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-paystack-signature');

    // 1. VERIFY WEBHOOK SIGNATURE (CRITICAL SECURITY)
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      console.error('❌ PAYSTACK_SECRET_KEY is missing!');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const hash = crypto
      .createHmac('sha512', secretKey)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      console.error('⚠️ Invalid webhook signature!');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // 2. PARSE WEBHOOK DATA
    const event = JSON.parse(body);
    console.log('📥 Webhook received:', event.event);

    // 3. HANDLE DIFFERENT EVENT TYPES
    switch (event.event) {
      case 'charge.success':
        await handleSuccessfulPayment(event.data);
        break;

      case 'charge.failed':
        await handleFailedPayment(event.data);
        break;

      case 'transfer.success':
        console.log('✅ Transfer successful:', event.data.reference);
        break;

      case 'transfer.failed':
        console.log('❌ Transfer failed:', event.data.reference);
        break;

      default:
        console.log('ℹ️ Unhandled event type:', event.event);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('💥 Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed', message: error.message },
      { status: 500 }
    );
  }
}

async function handleSuccessfulPayment(data: any) {
  try {
    console.log('✅ Processing successful payment:', data.reference);

    // Update order status in your database
    // Example:
    // await prisma.order.update({
    //   where: { paymentReference: data.reference },
    //   data: {
    //     paymentStatus: 'paid',
    //     paidAt: new Date(data.paid_at),
    //     paymentChannel: data.channel,
    //   }
    // });

    // Send confirmation email to customer
    // await sendPaymentConfirmationEmail(data.customer.email, data.reference);

    console.log(`✅ Order updated for reference: ${data.reference}`);
  } catch (error) {
    console.error('❌ Error handling successful payment:', error);
  }
}

async function handleFailedPayment(data: any) {
  try {
    console.log('❌ Processing failed payment:', data.reference);

    // Update order status
    // await prisma.order.update({
    //   where: { paymentReference: data.reference },
    //   data: {
    //     paymentStatus: 'failed',
    //     paymentNote: data.gateway_response,
    //   }
    // });

    // Notify customer about failed payment
    // await sendPaymentFailedEmail(data.customer.email, data.reference);

    console.log(`❌ Order marked as failed: ${data.reference}`);
  } catch (error) {
    console.error('❌ Error handling failed payment:', error);
  }
}

// Disable body parsing for webhook signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};