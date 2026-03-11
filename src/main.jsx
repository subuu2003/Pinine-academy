import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from '@/App'
import '@/index.css'
import ErrorBoundary from '@/components/ErrorBoundary'

console.log('=== Main.jsx Loading ===');

// Suppress React Router warnings
const originalWarn = console.warn;
console.warn = function(...args) {
  const message = args.join(' ');
  if (
    message.includes('React Router Future Flag') ||
    message.includes('Relative route resolution') ||
    message.includes('v7_startTransition') ||
    message.includes('v7_relativeSplatPath')
  ) {
    return;
  }
  originalWarn.apply(console, args);
};

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!publishableKey) {
  console.warn('⚠️ Missing Clerk Publishable Key - using placeholder')
}

console.log('4. Imports loaded successfully');

const root = document.getElementById('root')
console.log('5. Root element check:', root);

if (!root) {
  console.error('✗ CRITICAL: Root element not found!');
  document.body.innerHTML = '<div style="padding: 40px; text-align: center; font-family: Arial;"><h1 style="color: red;">Error: Root element not found</h1><p>The #root div is missing from index.html</p></div>';
} else {
  try {
    console.log('6. Creating React root...');
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <ErrorBoundary>
          <ClerkProvider publishableKey={publishableKey || 'pk_test_placeholder'}>
            <App />
          </ClerkProvider>
        </ErrorBoundary>
      </React.StrictMode>,
    )
    console.log('7. ✓ React render initiated');
  } catch (error) {
    console.error('✗ React render failed:', error);
    root.innerHTML = `<div style="padding: 40px; text-align: center; font-family: Arial;"><h1 style="color: red;">React Render Error</h1><p>${error.message}</p></div>`;
  }
}
