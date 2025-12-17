// ============================================
// VERIFY PAYMENT API (Enhanced Production Version)
// app/api/verify-payment/route.ts
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function POST(req: NextRequest) {
  try {
    // 1. Verify user session
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized', verified: false },
        { status: 401 }
      );
    }

    const { reference, expectedCurrency, expectedAmount } = await req.json();

    // 2. Validate inputs
    if (!reference) {
      return NextResponse.json(
        { error: 'Payment reference is required', verified: false },
        { status: 400 }
      );
    }

    if (!expectedAmount || expectedAmount <= 0) {
      console.error('❌ Expected amount not provided or invalid!');
      return NextResponse.json(
        { error: 'Invalid payment amount', verified: false },
        { status: 400 }
      );
    }

    // 3. Check for duplicate verification (prevent replay attacks)
    // TODO: Add Redis/database check to prevent same reference being verified twice
    // Example: const alreadyVerified = await checkIfReferenceUsed(reference);
    // if (alreadyVerified) return error

    // 4. Verify with Paystack (SERVER-SIDE)
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      console.error('❌ PAYSTACK_SECRET_KEY is missing!');
      return NextResponse.json(
        { error: 'Payment configuration error', verified: false },
        { status: 500 }
      );
    }

    const verifyUrl = `https://api.paystack.co/transaction/verify/${reference}`;
    
    const response = await fetch(verifyUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Paystack verification failed:', errorData);
      return NextResponse.json(
        { 
          error: 'Payment verification failed with Paystack', 
          details: errorData.message || 'Unable to verify payment',
          verified: false 
        },
        { status: 400 }
      );
    }

    const data = await response.json();

    // 5. Validate payment status
    const { status, amount, customer, currency, channel, paid_at, gateway_response } = data.data;

    if (status !== 'success') {
      return NextResponse.json(
        { 
          error: 'Payment was not successful',
          verified: false,
          status: status,
          message: gateway_response || 'Payment failed',
          // Common failure reasons for user feedback
          reason: getFailureReason(gateway_response)
        },
        { status: 400 }
      );
    }

    // 6. Verify customer email matches session
    if (customer.email.toLowerCase() !== session.user.email.toLowerCase()) {
      console.error('🚨 SECURITY: Email mismatch!', {
        paystack: customer.email,
        session: session.user.email,
        reference
      });
      return NextResponse.json(
        { 
          error: 'Payment email does not match your account',
          verified: false 
        },
        { status: 403 }
      );
    }

    // 7. CURRENCY VALIDATION
    if (expectedCurrency && currency !== expectedCurrency) {
      console.error('🚨 SECURITY: Currency mismatch!', {
        expected: expectedCurrency,
        received: currency,
        reference
      });
      return NextResponse.json(
        { 
          error: 'Payment currency mismatch',
          verified: false,
          expectedCurrency,
          receivedCurrency: currency
        },
        { status: 400 }
      );
    }

    // 8. Convert amount from kobo/cents to main currency unit
    const convertedAmount = amount / 100;

    // 9. 🔒 CRITICAL: AMOUNT VALIDATION (Anti-fraud)
    const amountDifference = Math.abs(convertedAmount - expectedAmount);
    const tolerance = 0.01; // Allow 1 cent difference for floating point

    if (amountDifference > tolerance) {
      console.error('🚨 FRAUD ALERT: Payment amount mismatch! 🚨', {
        expectedAmount,
        receivedAmount: convertedAmount,
        difference: amountDifference,
        currency,
        reference,
        customerEmail: customer.email,
        timestamp: new Date().toISOString()
      });

      // TODO: Log to fraud detection system
      // await logFraudAttempt({ reference, email: customer.email, ... });

      return NextResponse.json(
        { 
          error: 'Payment amount does not match order total',
          verified: false,
          expectedAmount,
          receivedAmount: convertedAmount,
          message: 'Payment rejected for security reasons. The amount paid does not match your cart total.'
        },
        { status: 400 }
      );
    }

    // 10. SUCCESS - Payment is fully verified ✅
    console.log('✅ Payment verified successfully:', {
      reference,
      amount: convertedAmount,
      expectedAmount,
      currency,
      email: customer.email,
      channel,
      timestamp: new Date().toISOString()
    });

    // TODO: Mark reference as used to prevent replay attacks
    // await markReferenceAsUsed(reference);

    return NextResponse.json({
      success: true,
      verified: true,
      amount: convertedAmount,
      currency,
      reference,
      paidAt: paid_at,
      channel: channel,
      customerEmail: customer.email,
    });

  } catch (error: any) {
    console.error('💥 Payment verification error:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      { 
        error: 'Internal server error during payment verification',
        verified: false,
        message: 'We could not verify your payment. Please contact support if money was deducted.'
      },
      { status: 500 }
    );
  }
}

/**
 * Helper function to provide user-friendly error messages
 */
function getFailureReason(gatewayResponse?: string): string {
  if (!gatewayResponse) return 'Payment failed';
  
  const response = gatewayResponse.toLowerCase();
  
  if (response.includes('insufficient')) {
    return 'Insufficient funds in your account';
  }
  if (response.includes('declined') || response.includes('not honored')) {
    return 'Card declined by your bank. Please try another card or contact your bank';
  }
  if (response.includes('expired')) {
    return 'Card has expired. Please use a different card';
  }
  if (response.includes('pin')) {
    return 'Incorrect PIN entered';
  }
  if (response.includes('timeout')) {
    return 'Transaction timeout. Please try again';
  }
  if (response.includes('cancelled')) {
    return 'Transaction was cancelled';
  }
  if (response.includes('limit')) {
    return 'Transaction limit exceeded';
  }
  
  return 'Payment could not be processed. Please try again or use another payment method';
}