import React from 'react';

export default function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-[#0d9488] rounded-full animate-spin mb-4"></div>
      <p className="text-slate-600 text-sm">{message}</p>
    </div>
  );
}
