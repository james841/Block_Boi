'use client'
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, User, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin/dashboard';

  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        router.push(callbackUrl);
        router.refresh();
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b0b] flex font-sans text-white selection:bg-orange-500/30 selection:text-orange-400">
      
      {/* LEFT PANE: LOG IN FORM CONTROLLER */}
      <div className="w-full lg:w-[42%] flex flex-col justify-between p-8 sm:p-12 md:p-20 bg-[#0e0e0e] border-r border-white/[0.04] relative z-10">
        
        {/* Header Branding */}
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-600/20 ring-1 ring-orange-500/30">
            <Lock className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <span className="font-black text-md tracking-wider uppercase text-white">Admin Portal</span>
        </div>

        {/* Main Content Form Container */}
        <div className="w-full max-w-sm mx-auto my-auto">
          <h1 className="text-3xl font-black tracking-tight text-white mb-2 uppercase">Admin Portal</h1>
          <p className="text-gray-400 text-sm mb-8 font-medium">Sign in to access the dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 bg-rose-950/30 border border-rose-800/40 rounded-lg">
                <p className="text-rose-400 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Username Input Field */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest">Username</label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-orange-500 transition-colors" />
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#1c1c1c] border border-white/[0.1] rounded-lg focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 text-white text-sm placeholder-gray-600 transition-colors"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            {/* Password Input Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest">Password</label>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-orange-500 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-2.5 bg-[#1c1c1c] border border-white/[0.1] rounded-lg focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 text-white text-sm placeholder-gray-600 transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Action Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-3 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white text-sm font-bold uppercase tracking-wider rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-600/10 hover:shadow-orange-600/20"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Back Navigation */}
          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-xs font-medium text-gray-500 hover:text-orange-400 transition-colors group"
            >
              <span className="inline-block transition-transform group-hover:-translate-x-1 mr-1.5">←</span> Back to Store
            </button>
          </div>
        </div>

        {/* Hidden spacer baseline element */}
        <div className="mt-12 opacity-0 select-none pointer-events-none text-[10px]">
          Spacer
        </div>
      </div>

      {/* RIGHT PANE: HERO DISPLAY WITH ORANGE RADIAL AMBIENT GLOW */}
      <div className="hidden lg:flex lg:w-[58%] bg-[#080808] items-center justify-center p-20 relative overflow-hidden">
        
        {/* Micro-dot structural overlay mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff02_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        
        {/* Soft atmospheric orange background glow leaking from bottom left */}
        <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-orange-600/10 rounded-full blur-[128px] pointer-events-none" />

        {/* Secure badge element */}
        <div className="absolute top-8 right-8">
          <div className="px-3 py-1.5 bg-white/[0.02] border border-white/[0.06] text-[11px] font-bold tracking-widest text-orange-400 rounded-lg select-none uppercase">
            Secure Session
          </div>
        </div>

        {/* System Quote Layout */}
        <div className="max-w-xl relative z-10">
          <span className="text-6xl text-orange-500/10 font-serif absolute -top-10 -left-6 select-none">“</span>
          <blockquote className="text-2xl md:text-3xl font-bold tracking-tight text-gray-100 leading-snug mb-8">
            Control center established. Accessing your secure inventory, transaction matrix, and customer analytics engine starts right here.
          </blockquote>
          
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-orange-600/10 border border-orange-500/20 flex items-center justify-center text-[11px] font-bold text-orange-400 shadow-inner">
              SYS
            </div>
            <div>
              <p className="text-sm font-bold text-gray-200">Central Operations Hub</p>
              <p className="text-xs text-gray-500 font-medium">System Verified Environment</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}