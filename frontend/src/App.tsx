import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './contexts/useAuth'
import { Sidebar } from './components/Sidebar'
import { Dashboard } from './pages/Dashboard'
import { Customers } from './pages/Customers'
import { CustomerDetail } from './pages/CustomerDetail'
import { Items } from './pages/Items'
import { TransportTypes } from './pages/TransportTypes'
import { Orders } from './pages/Orders'
import { OrderDetail } from './pages/OrderDetail'
import { DeliverySchedulePage } from './pages/DeliverySchedule'
import { AuditLogs } from './pages/AuditLogs'
import { Login } from './pages/Login'

const queryClient = new QueryClient()

function AppRoutes() {
  const { isAuthenticated } = useAuth()

  return isAuthenticated ? (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 max-w-[1200px] w-full">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />
          <Route path="/items" element={<Items />} />
          <Route path="/transport-types" element={<TransportTypes />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/orders/:id/delivery" element={<DeliverySchedulePage />} />
          <Route path="/audit-logs" element={<AuditLogs />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  ) : (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
