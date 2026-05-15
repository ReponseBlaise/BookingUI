import { StrictMode as _StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.tsx'
import { StoreProvider } from './store/StoreContext'
import { AuthProvider } from './features/auth'

createRoot(document.getElementById('root')!).render(
  <StoreProvider>
    <AuthProvider>
      <App />
      <Toaster position="bottom-right" />
    </AuthProvider>
  </StoreProvider>,
)
