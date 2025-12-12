import { Outlet } from 'react-router'
import { Header } from '../custom-ui/Header'

export function MainLayout() {
  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <Header />
      <div className="w-full h-full grow min-h-0">
        <Outlet />
      </div>
    </div>
  )
}
