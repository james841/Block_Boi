// lib/adminPaths.ts
// This file helps manage all admin URLs from one place

// Get the secure admin path from environment variable
const ADMIN_BASE_PATH = process.env.NEXT_PUBLIC_ADMIN_BASE_PATH || '/admin';

export const adminPaths = {
  // Base path
  base: ADMIN_BASE_PATH,
  
  // Auth paths
  login: `${ADMIN_BASE_PATH}/login`,
  logout: '/api/admin/logout',
  
  // Dashboard
  dashboard: `${ADMIN_BASE_PATH}/dashboard`,
  
  // Products
  products: `${ADMIN_BASE_PATH}/products`,
  productsAdd: `${ADMIN_BASE_PATH}/products/add`,
  productsEdit: (id: number | string) => `${ADMIN_BASE_PATH}/products/edit/${id}`,
  
  // Slider
  slider: `${ADMIN_BASE_PATH}/slider`,
  
  // Categories
  categories: `${ADMIN_BASE_PATH}/CategoryShowcase`,
  
  // API endpoints (these don't change)
  api: {
    login: '/api/admin/login',
    logout: '/api/admin/logout',
    me: '/api/admin/me',
    stats: '/api/admin/stats',
    products: '/api/Products',
    orders: '/api/orders',
    slider: '/api/slider',
    categories: '/api/CategoriesShowcase',
  }
};

// Helper function to check if a path is an admin route
export function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith(ADMIN_BASE_PATH);
}

// Helper to create login URL with callback
export function getLoginUrl(callbackUrl?: string): string {
  const url = adminPaths.login;
  if (callbackUrl) {
    return `${url}?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  }
  return url;
}

// Export the base path for use in components
export { ADMIN_BASE_PATH };