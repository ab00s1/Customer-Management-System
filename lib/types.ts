export type ComplaintStatus = "pending" | "in-progress" | "resolved" | "closed"
export type ComplaintPriority = "low" | "medium" | "high" | "urgent"
export type ComplaintCategory = "technical" | "billing" | "service" | "product" | "other"

export interface Complaint {
  _id: string
  title: string
  description: string
  category: ComplaintCategory
  priority: ComplaintPriority
  status: ComplaintStatus
  submittedBy: User
  assignedTo?: User
  assignedAt?: string
  resolvedAt?: string
  resolutionNotes?: string
  attachments?: ComplaintAttachment[]
  tags?: string[]
  isUrgent: boolean
  estimatedResolutionTime?: number
  createdAt: string
  updatedAt: string
  // Virtual fields
  age?: number
  statusColor?: string
  priorityColor?: string
}

export interface ComplaintAttachment {
  filename: string
  originalName: string
  mimeType: string
  size: number
  uploadedAt: string
}

export interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: "user" | "admin"
  phoneNumber?: string
  isActive: boolean
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

export interface ComplaintStats {
  total: number
  pending: number
  inProgress: number
  resolved: number
  closed: number
  urgent: number
  high: number
}

export interface ComplaintFilters {
  status?: ComplaintStatus
  priority?: ComplaintPriority
  category?: ComplaintCategory
  search?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

export interface ComplaintResponse {
  complaints: Complaint[]
  pagination: PaginationInfo
  stats?: ComplaintStats
}

export interface CategoryStat {
  _id: string
  count: number
}

export interface PriorityStat {
  _id: string
  count: number
}
