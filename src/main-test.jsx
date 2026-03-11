import React from 'react'
import ReactDOM from 'react-dom/client'
import '@/index.css'

function TestApp() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '48px', margin: '0 0 20px 0' }}>✅ React is Working!</h1>
      <p style={{ fontSize: '20px', margin: '10px 0' }}>If you see this, React is rendering correctly.</p>
      <p style={{ fontSize: '16px', margin: '10px 0', opacity: 0.8 }}>Now loading the full app...</p>
    </div>
  )
}

const root = document.getElementById('root')
console.log('✓ Root element found:', !!root)

if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <TestApp />
    </React.StrictMode>
  )
  console.log('✓ React render called')
} else {
  console.error('✗ Root element not found!')
}
