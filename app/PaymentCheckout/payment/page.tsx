'use client';

import { useState, useEffect } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Info, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';
import dynamic from 'next/dynamic';

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
  const [structuredError, setStructuredError] = useState<{
    type: 'error' | 'warning' | 'info';
    title: string;
    message: string;
    reference?: string;
  } | null>(null);

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

  const publicKey = isMounted ? process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY : null;
  
  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!publicKey) {
    return (
      <div className="min-h-screen flex items-center justify-center text-black bg-white">
        <div className="text-center p-8 border border-black max-w-md">
          <h2 className="text-xl font-black uppercase tracking-tighter mb-4">System Offline</h2>
          <p className="text-xs uppercase font-bold tracking-widest opacity-40">Payment gateway configuration missing.</p>
        </div>
      </div>
    );
  }

  const convertedTotal = convertPrice(cartTotal);
  const paystackAmount = Math.round(convertedTotal * 100);

  const handlePaymentSuccess = async (reference: any) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setStructuredError(null);

    try {
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
        setStructuredError({
          type: verifyResponse.status === 500 ? 'warning' : 'error',
          title: 'Verification Failed',
          message: verifiedPayment.message || 'Verification failed. Please contact support.',
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
        shippingAddress: { ...formData, phone: formData.phone },
        paymentStatus: 'paid',
        paymentReference: reference.reference,
        items: cartItems.map((item) => ({
          productId: item.id,
          productName: item.name,
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

      if (!orderResponse.ok) throw new Error('Order creation failed');

      const orderResult = await orderResponse.json();
      clearCart();
      router.push(`/orders/${orderResult.orderId}?payment=success`);

    } catch (error: any) {
      setStructuredError({
        type: 'error',
        title: 'System Error',
        message: error.message || 'An unexpected error occurred.',
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
        title: 'Archive Intact',
        message: 'Transaction was closed. Your selection is still saved in the bag.',
      });
    }
  };

  const ErrorDisplay = () => {
    if (!structuredError) return null;
    const styles = {
      error: 'border-red-500 bg-red-50 text-red-900',
      warning: 'border-black bg-black text-white',
      info: 'border-black bg-white text-black'
    };

    return (
      <div className={`border p-6 mb-8 transition-all duration-500 ${styles[structuredError.type]}`}>
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] mb-2">{structuredError.title}</h4>
            <p className="text-xs font-medium leading-relaxed opacity-80">{structuredError.message}</p>
            {structuredError.reference && (
              <p className="text-[9px] mt-4 font-mono opacity-50 uppercase">REF: {structuredError.reference}</p>
            )}
          </div>
          <button onClick={() => setStructuredError(null)} className="opacity-40 hover:opacity-100">
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  const componentProps = {
    email: session?.user?.email || formData.email,
    amount: paystackAmount,
    currency: currentCurrency.code,
    publicKey,
    text: isProcessing ? 'PROCESSING...' : `CONFIRM & PAY ${formatPrice(cartTotal)}`,
    onSuccess: handlePaymentSuccess,
    onClose: handlePaymentClose,
    channels: ['card', 'bank', 'ussd', 'bank_transfer'],
  };

  return (
    <div className="min-h-screen bg-white text-black py-20">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* ARCHIVE LOGO / HEADER */}
        <header className="mb-16 border-b border-black pb-8 flex flex-col md:flex-row justify-between items-baseline gap-4">
          <div>
            <h1 className="text-5xl font-black uppercase tracking-tighter leading-none">Checkout</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/40 mt-3">Verified Transaction Protocol</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-black/40">Archive Bag</p>
            <p className="text-2xl font-black tracking-tighter">{formatPrice(cartTotal)}</p>
          </div>
        </header>

        <ErrorDisplay />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* LEFT: FORM DATA */}
          <div className="lg:col-span-7 space-y-12">
            <section>
              <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                01. Shipping Logistics <ArrowRight className="w-3 h-3" />
              </h3>
              
              <div className="grid grid-cols-2 gap-x-6 gap-y-8">
                <div className="col-span-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-black/40 block mb-2">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-transparent border-b border-black/10 py-3 focus:border-black transition-colors outline-none text-sm font-bold uppercase"
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-black/40 block mb-2">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-transparent border-b border-black/10 py-3 focus:border-black transition-colors outline-none text-sm font-bold uppercase"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-black/40 block mb-2">Email Address</label>
                  <input type="text" value={formData.email} readOnly className="w-full bg-transparent border-b border-black/5 py-3 text-black/30 outline-none text-sm font-bold cursor-not-allowed" />
                </div>
                <div className="col-span-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-black/40 block mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    placeholder="+234"
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-transparent border-b border-black/10 py-3 focus:border-black transition-colors outline-none text-sm font-bold"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-black/40 block mb-2">Destination Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-transparent border-b border-black/10 py-3 focus:border-black transition-colors outline-none text-sm font-bold"
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-black/40 block mb-2">City</label>
                  <input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="w-full bg-transparent border-b border-black/10 py-3 focus:border-black outline-none text-sm font-bold uppercase" />
                </div>
                <div className="col-span-1 flex gap-4">
                   <div className="flex-1">
                     <label className="text-[9px] font-black uppercase tracking-widest text-black/40 block mb-2">State</label>
                     <input type="text" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className="w-full bg-transparent border-b border-black/10 py-3 focus:border-black outline-none text-sm font-bold uppercase" />
                   </div>
                   <div className="w-24">
                     <label className="text-[9px] font-black uppercase tracking-widest text-black/40 block mb-2">Zip</label>
                     <input type="text" value={formData.zipCode} onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })} className="w-full bg-transparent border-b border-black/10 py-3 focus:border-black outline-none text-sm font-bold uppercase" />
                   </div>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT: SUMMARY & PAYMENT */}
          <div className="lg:col-span-5">
            <div className="sticky top-12 border border-black p-8 bg-white shadow-[20px_20px_0px_0px_rgba(0,0,0,0.03)]">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-8">02. Archive Summary</h3>
              
              <div className="space-y-6 mb-10 max-h-[300px] overflow-y-auto pr-4 scrollbar-hide">
                {cartItems.map((item) => (
                  <div key={`${item.id}-${item.selectedSize}`} className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="text-[11px] font-black uppercase leading-tight">{item.name}</p>
                      <p className="text-[9px] uppercase tracking-widest text-black/40 mt-1">
                        {item.selectedSize} / {item.selectedColor} — QTY: {item.quantity}
                      </p>
                    </div>
                    <p className="text-[11px] font-black">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-black pt-6 space-y-4">
                <div className="flex justify-between text-xs font-black uppercase tracking-widest opacity-40">
                  <span>Subtotal</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-xs font-black uppercase tracking-widest opacity-40">
                  <span>Shipping</span>
                  <span>Calculated</span>
                </div>
                <div className="flex justify-between items-baseline pt-4 border-t border-black/5">
                  <span className="text-xs font-black uppercase tracking-[0.2em]">Total</span>
                  <span className="text-3xl font-black tracking-tighter leading-none">{formatPrice(cartTotal)}</span>
                </div>
              </div>

              <div className="mt-12 space-y-4">
                <PaystackButton
                  {...componentProps}
                  className={`w-full py-6 text-[11px] font-black uppercase tracking-[0.4em] transition-all duration-500 ${
                    isFormValid() && !isProcessing
                      ? 'bg-black text-white hover:bg-black/80'
                      : 'bg-black/5 text-black/20 cursor-not-allowed border border-black/10'
                  }`}
                  disabled={!isFormValid() || isProcessing}
                />
                <div className="flex items-center justify-center gap-2 opacity-30">
                  <ShieldCheck className="w-3 h-3" />
                  <p className="text-[8px] font-black uppercase tracking-widest">SSL Encrypted / Secure Terminal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}