import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { loadAnimeAceFont } from './remotion/loadAnimeAceFont'
import App from './App.tsx'

void loadAnimeAceFont()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
