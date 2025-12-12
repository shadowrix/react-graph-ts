import { Route, Routes } from 'react-router'
import { Main } from '../pages/Main'
import { Docs } from '../pages/Docs'
import { MainLayout } from '../layouts/MainLayout'
import { PREFIX_ROUTE } from '@/constants'

export function Router() {
  return (
    <Routes>
      <Route path={PREFIX_ROUTE} element={<MainLayout />}>
        <Route index element={<Main />} />
        <Route path="docs" element={<Docs />} />
      </Route>
    </Routes>
  )
}
