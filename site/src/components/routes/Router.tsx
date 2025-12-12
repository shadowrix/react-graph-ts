import { Route, Routes } from 'react-router'
import { Main } from '../pages/Main'

export function Router() {
  return (
    <Routes>
      <Route path="react-graph-ts">
        <Route index element={<Main />} />
      </Route>
    </Routes>
  )
}
