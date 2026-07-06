export interface Customer {
  id: number
  name: string
  email?: string
  phone?: string
  document?: string
  createdAt: string
  updatedAt: string
  orders?: Order[]
  authorizedTransportTypes?: TransportType[]
}

export interface Item {
  id: number
  name: string
  description?: string
  price: number
  stockQuantity: number
  createdAt: string
  updatedAt: string
}

export interface TransportType {
  id: number
  name: string
  description?: string
  createdAt: string
}

export interface OrderItem {
  id: number
  orderId: number
  itemId: number
  quantity: number
  unitPrice: number
  item: Item
}

export type OrderStatus = 'Criada' | 'Planejada' | 'Agendada' | 'EmTransporte' | 'Entregue'

export interface Order {
  id: number
  customerId: number
  customer: Customer
  transportTypeId: number
  transportType: TransportType
  status: OrderStatus
  totalAmount: number
  createdAt: string
  updatedAt: string
  items: OrderItem[]
  deliverySchedule?: DeliverySchedule
}

export interface DeliverySchedule {
  id: number
  orderId: number
  scheduledDate: string
  serviceWindowStart?: string
  serviceWindowEnd?: string
  createdAt: string
  updatedAt: string
}

export interface AuditLog {
  id: number
  entityType: string
  entityId: number
  action: string
  oldValues?: string
  newValues?: string
  changedBy?: string
  changedAt: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  username: string
  role: string
}

export interface DashboardData {
  criadas: number
  agendadas: number
  emTransporte: number
  recentOrders: {
    id: number
    customerName: string
    status: OrderStatus
    totalAmount: number
    createdAt: string
  }[]
}
