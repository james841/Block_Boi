'use client'
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn('google', { 
        callbackUrl,
        redirect: true 
      });
    } catch (error) {
      console.error('Sign in error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="max-w-[400px] w-full">
        
        {/* BRAND IDENTITY */}
        <div className="mb-16 text-center">
          <div className="inline-block p-5 border border-black mb-10">
            <ShoppingBag className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter leading-none mb-4">
            Archive <br /> Access
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30">
            Authentication Required
          </p>
        </div>

        {/* ACTION AREA */}
        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-4 px-6 py-5 bg-black text-white hover:bg-black/90 transition-all duration-300 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="text-[11px] font-black uppercase tracking-[0.3em]">Continue with Google</span>
              </>
            )}
          </button>

          {/* SECONDARY LINK */}
          <div className="pt-8 border-t border-black/5 mt-8">
            <div className="text-[9px] font-black uppercase tracking-widest text-black/30 text-center leading-relaxed">
              By accessing the archive, you agree to our <br />
              <Link href="/terms" className="text-black hover:underline underline-offset-4 mx-1">Terms</Link> 
              & 
              <Link href="/privacy" className="text-black hover:underline underline-offset-4 mx-1">Privacy</Link>
            </div>
          </div>
        </div>

        {/* NAVIGATION BACK */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="text-[10px] font-black uppercase tracking-widest text-black/40 hover:text-black transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-3 h-3" /> Exit to Store
          </Link>
        </div>
      </div>
    </div>
  );
}