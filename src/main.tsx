import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './console.css'
import './styles/index-zero.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
