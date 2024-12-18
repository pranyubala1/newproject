import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Crowdfunding from './Crowdfunding.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Crowdfunding />
  </StrictMode>,
)
