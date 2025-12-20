import { BrowserRouter } from 'react-router'
import { Toaster } from 'sonner'

import { Router } from './components/routes'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <Router />
    </BrowserRouter>
  )
}
