import { BrowserRouter } from 'react-router'

import { Router } from './components/routes'
import { Header } from './components/custom-ui/Header'

export default function App() {
  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <Header />
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    </div>
  )
}
