import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'


function getURLParameter(name: string): string | null {
  return new URLSearchParams(window.location.search).get(name);
}

let kraj = getURLParameter('kraj');



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App kraj={kraj} />
  </StrictMode>,
)
