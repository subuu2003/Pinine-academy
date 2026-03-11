import * as React from 'react'
import * as ReactDOM from 'react-dom/client'

console.log('=== MINIMAL TEST ===');
console.log('React imported:', !!React);
console.log('ReactDOM imported:', !!ReactDOM);

const root = document.getElementById('root');
console.log('Root found:', !!root);

if (root) {
  ReactDOM.createRoot(root).render(
    React.createElement('div', {
      style: {
        padding: '40px',
        background: '#4CAF50',
        color: 'white',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        fontFamily: 'Arial'
      }
    },
      React.createElement('h1', { style: { fontSize: '48px', margin: 0 } }, '✅ REACT WORKS!'),
      React.createElement('p', { style: { fontSize: '24px', marginTop: '20px' } }, 'The app is rendering successfully')
    )
  );
  console.log('✓ Render complete');
}
