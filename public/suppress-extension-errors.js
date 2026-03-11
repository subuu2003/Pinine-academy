// Suppress browser extension errors in console
(function() {
  const originalError = console.error;
  console.error = function(...args) {
    const errorString = args.join(' ');
    
    // Ignore browser extension errors
    if (
      errorString.includes('message channel closed') ||
      errorString.includes('Manifest:') ||
      errorString.includes('chrome-extension://') ||
      errorString.includes('moz-extension://')
    ) {
      return;
    }
    
    originalError.apply(console, args);
  };
})();
