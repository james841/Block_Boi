'use client';

import { useState, useEffect } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamically import PaystackButton to avoid SSR issues
const PaystackButton = dynamic(
  () => import('react-paystack').then((mod) => mod.PaystackButton),
  { ssr: false }
);

export default function SecurePaymentCheckout() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { currentCurrency, convertPrice, formatPrice } = useCurrency();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Nigeria',
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // YOUR ORIGINAL STRING ERROR (kept for backward compat)
  const [paymentError, setPaymentError] = useState('');

  // NEW: ENHANCED TYPED ERROR STATE (ADDED, NOT REPLACING)
  const [structuredError, setStructuredError] = useState<{
    type: 'error' | 'warning' | 'info';
    title: string;
    message: string;
    reference?: string;
  } | null>(null);

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        email: session.user.email || '',
        firstName: session.user.name?.split(' ')[0] || '',
        lastName: session.user.name?.split(' ').slice(1).join(' ') || '',
      }));
    }
  }, [session]);

  const isFormValid = () => {
    return (
      formData.firstName.trim() &&
      formData.lastName.trim() &&
      formData.email.trim() &&
      formData.phone.trim() &&
      formData.address.trim() &&
      formData.city.trim() &&
      formData.state.trim() &&
      formData.zipCode.trim() &&
      cartItems.length > 0
    );
  };

  // Get public key safely - only on client side
  const publicKey = isMounted ? process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY : null;
  
  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!publicKey) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Configuration Error</h2>
          <p>Payment system is not configured. Please contact support.</p>
        </div>
      </div>
    );
  }

  const convertedTotal = convertPrice(cartTotal);
  const paystackAmount = Math.round(convertedTotal * 100);

  // FULLY UPGRADED SUCCESS HANDLER (with rich error types)
  const handlePaymentSuccess = async (reference: any) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setPaymentError('');
    setStructuredError(null); // Clear enhanced error too

    try {
      console.log('Payment initiated, verifying...', reference.reference);

      const verifyResponse = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          reference: reference.reference,
          expectedCurrency: currentCurrency.code,
          expectedAmount: convertedTotal,
        }),
      });

      const verifiedPayment = await verifyResponse.json();

      if (!verifyResponse.ok) {
        if (verifyResponse.status === 400) {
          setStructuredError({
            type: 'error',
            title: 'Payment Failed',
            message: verifiedPayment.reason || verifiedPayment.message || 'Your payment could not be processed.',
            reference: reference.reference
          });
          return;
        }
        if (verifyResponse.status === 403) {
          setStructuredError({
            type: 'error',
            title: 'Security Error',
            message: verifiedPayment.error || 'Payment verification failed for security reasons.',
            reference: reference.reference
          });
          return;
        }
        if (verifyResponse.status === 500) {
          setStructuredError({
            type: 'warning',
            title: 'Verification Error',
            message: 'We could not verify your payment. If money was deducted, please contact support with this reference number.',
            reference: reference.reference
          });
          return;
        }
        throw new Error(verifiedPayment.error || 'Payment verification failed');
      }

      if (!verifiedPayment.verified) {
        throw new Error('Payment could not be verified');
      }

      console.log('Payment verified:', verifiedPayment);

      if (Math.abs(verifiedPayment.amount - convertedTotal) > 0.01) {
        setStructuredError({
          type: 'error',
          title: 'Amount Mismatch',
          message: `Payment amount mismatch! Expected ${formatPrice(cartTotal)}, but received ${currentCurrency.symbol}${verifiedPayment.amount.toFixed(2)}`,
          reference: reference.reference
        });
        return;
      }

      const orderData = {
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        userName: session?.user?.name || `${formData.firstName} ${formData.lastName}`,
        total: cartTotal,
        displayTotal: convertedTotal,
        displayCurrency: currentCurrency.code,
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
          phone: formData.phone,
        },
        paymentStatus: 'paid',
        paymentReference: reference.reference,
        paymentChannel: verifiedPayment.channel,
        paymentCurrency: verifiedPayment.currency,
        paidAt: verifiedPayment.paidAt,
        items: cartItems.map((item) => ({
          productId: item.id,
          productName: item.name,
          productImage: item.imageUrl,
          quantity: item.quantity,
          price: item.price,
          selectedColor: item.selectedColor,
          selectedSize: item.selectedSize,
        })),
      };

      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!orderResponse.ok) {
        const error = await orderResponse.json();
        setStructuredError({
          type: 'warning',
          title: 'Order Creation Failed',
          message: 'Payment was successful but we could not create your order. Please contact support immediately.',
          reference: reference.reference
        });
        return;
      }

      const orderResult = await orderResponse.json();
      console.log('Order created successfully:', orderResult);

      clearCart();
      router.push(`/orders/${orderResult.orderId}?payment=success`);

    } catch (error: any) {
      console.error('Payment processing error:', error);
      setStructuredError({
        type: 'error',
        title: 'Payment Error',
        message: error.message || 'An unexpected error occurred. Please contact support if money was deducted.',
        reference: reference?.reference
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentClose = () => {
    if (!isProcessing) {
      setStructuredError({
        type: 'info',
        title: 'Payment Cancelled',
        message: 'You cancelled the payment. Your cart is still saved.',
      });
    }
  };

  // BEAUTIFUL ENHANCED ERROR DISPLAY COMPONENT
  const ErrorDisplay = () => {
    if (!structuredError) return null;

    const bgColors = {
      error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
      info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    };
    const iconColors = { error: 'text-red-600 dark:text-red-400', warning: 'text-yellow-600 dark:text-yellow-400', info: 'text-blue-600 dark:text-blue-400' };
    const textColors = { error: 'text-red-900 dark:text-red-100', warning: 'text-yellow-900 dark:text-yellow-100', info: 'text-blue-900 dark:text-blue-100' };
    const subtextColors = { error: 'text-red-700 dark:text-red-300', warning: 'text-yellow-700 dark:text-yellow-300', info: 'text-blue-700 dark:text-blue-300' };

    return (
      <div className={`${bgColors[structuredError.type]} border-2 rounded-xl p-4 mb-6`}>
        <div className="flex items-start gap-3">
          <svg className={`w-6 h-6 ${iconColors[structuredError.type]} flex-shrink-0 mt-0.5`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {structuredError.type === 'error' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
            {structuredError.type === 'warning' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />}
            {structuredError.type === 'info' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
          </svg>
          <div className="flex-1">
            <p className={`font-semibold ${textColors[structuredError.type]}`}>{structuredError.title}</p>
            <p className={`text-sm ${subtextColors[structuredError.type]} mt-1`}>{structuredError.message}</p>
            
            {structuredError.reference && (
              <div className={`mt-3 p-2 bg-white/50 dark:bg-black/20 rounded border ${structuredError.type === 'error' ? 'border-red-300' : 'border-yellow-300'}`}>
                <p className={`text-xs font-mono ${subtextColors[structuredError.type]}`}>Reference: {structuredError.reference}</p>
                <button
                  onClick={() => { 
                    if (typeof navigator !== 'undefined') {
                      navigator.clipboard.writeText(structuredError.reference!); 
                      alert('Copied!'); 
                    }
                  }}
                  className={`text-xs mt-1 underline ${subtextColors[structuredError.type]}`}
                >
                  Copy reference
                </button>
              </div>
            )}
          </div>
          <button onClick={() => setStructuredError(null)} className={`${iconColors[structuredError.type]} hover:opacity-70`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {(structuredError.type === 'error' || structuredError.type === 'warning') && (
          <div className={`mt-4 pt-3 border-t ${structuredError.type === 'error' ? 'border-red-200' : 'border-yellow-200'}`}>
            <p className={`text-xs ${subtextColors[structuredError.type]}`}>
              Need help? Contact support at <a href="mailto:blockboicouture@gmail.com" className="underline font-semibold">blockboicouture@gmail.com</a>
            </p>
          </div>
        )}
      </div>
    );
  };

  const componentProps = {
    email: session?.user?.email || formData.email,
    amount: paystackAmount,
    currency: currentCurrency.code,
    publicKey,
    text: isProcessing ? 'Verifying Payment...' : `Pay ${formatPrice(cartTotal)}`,
    onSuccess: handlePaymentSuccess,
    onClose: handlePaymentClose,
    metadata: {
      custom_fields: [
        { display_name: 'Customer Name', variable_name: 'customer_name', value: `${formData.firstName} ${formData.lastName}` },
        { display_name: 'Phone Number', variable_name: 'phone_number', value: formData.phone },
        { display_name: 'Currency', variable_name: 'payment_currency', value: currentCurrency.code },
        { display_name: 'Expected Amount', variable_name: 'expected_amount', value: convertedTotal.toFixed(2) },
      ]
    },
    channels: ['card', 'bank', 'ussd', 'bank_transfer'],
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    router.push('/auth/signin?callbackUrl=/checkout/payment');
    return null;
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <button onClick={() => router.push('/products')} className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">Secure Checkout</h1>

        {/* Currency Display */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{currentCurrency.symbol}</span>
              <div>
                <p className="font-semibold text-blue-900 dark:text-blue-100">Payment Currency</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {currentCurrency.name} ({currentCurrency.code})
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-600 dark:text-blue-400">You will pay</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{formatPrice(cartTotal)}</p>
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div>
              <p className="font-semibold text-green-900 dark:text-green-100">Secure Payment with Amount Verification</p>
              <p className="text-sm text-green-700 dark:text-green-300">Payment amount is validated on both client and server</p>
            </div>
          </div>
        </div>

        {/* NEW: ENHANCED ERROR DISPLAY - RIGHT AFTER SECURITY BADGE */}
        <ErrorDisplay />

        {/* YOUR ORIGINAL SIMPLE ERROR (still here if needed) */}
        {paymentError && (
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-semibold text-red-900 dark:text-red-100">Payment Error</p>
                <p className="text-sm text-red-700 dark:text-red-300">{paymentError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Google Account Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            {session.user.image && (
              <img 
                src={session.user.image} 
                alt={session.user.name || 'User'} 
                className="w-12 h-12 rounded-full border-2 border-blue-500"
              />
            )}
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Signed in as</p>
              <p className="font-semibold text-blue-900 dark:text-blue-100">{session.user.email}</p>
            </div>
          </div>
        </div>

        {/* YOUR FULL ORIGINAL FORM - 100% UNTOUCHED */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Shipping Information</h2>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                  disabled={isProcessing}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email *</label>
              <input
                type="email"
                value={session.user.email || formData.email}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Using your Google account email</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="+234 XXX XXX XXXX"
                required
                disabled={isProcessing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Delivery Address *</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Street address, house number, etc."
                required
                disabled={isProcessing}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">City *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">State *</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Zip Code *</label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                  disabled={isProcessing}
                />
              </div>
            </div>

            <div className="mt-8 pt-8 border-t dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Order Summary</h3>
              <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                {cartItems.map((item) => (
                  <div
                    key={`${item.id}-${item.selectedColor}-${item.selectedSize}`}
                    className="flex justify-between text-sm py-2 border-b border-gray-100 dark:border-gray-700"
                  >
                    <span className="text-gray-600 dark:text-gray-400">
                      {item.name} {item.selectedColor && `(${item.selectedColor})`} {item.selectedSize && `- ${item.selectedSize}`} (x{item.quantity})
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-gray-100 pt-4 border-t dark:border-gray-700">
                <span>Total</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                All payments are secure and encrypted • Paying in {currentCurrency.name}
              </p>
            </div>

            <div className="mt-8">
              <PaystackButton
                {...componentProps}
                className={`w-full py-4 font-semibold rounded-lg transition-colors ${
                  isFormValid() && !isProcessing
                    ? 'bg-orange-500 text-white hover:bg-orange-600 cursor-pointer'
                    : 'bg-gray-400 text-white cursor-not-allowed'
                }`}
                disabled={!isFormValid() || isProcessing}
              />
              <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">
                You will be redirected to Paystack secure payment page
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}