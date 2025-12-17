
// app/admin/login/page.tsx
import { Suspense } from 'react';
import AdminLoginForm from './AdminLoginForm';


export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <AdminLoginForm />
    </Suspense>
  );
}