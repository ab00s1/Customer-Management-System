import type { 
  Complaint, 
  ComplaintResponse, 
  ComplaintFilters, 
  ComplaintStats,
  CategoryStat,
  PriorityStat 
} from './types'

const API_BASE_URL = 'https://customer-management-system-cktj.onrender.com/api'

class ComplaintService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  }

  // Create new complaint
  async createComplaint(complaintData: {
    title: string
    description: string
    category: string
    priority: string
    tags?: string[]
  }): Promise<{ success: boolean; message: string; data?: { complaint: Complaint } }> {
    try {
      const response = await fetch(`${API_BASE_URL}/complaints`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(complaintData),
      })

      const data = await response.json()

      if (data.status === 'success') {
        return { success: true, message: data.message, data: data.data }
      } else {
        return { success: false, message: data.message || 'Failed to create complaint' }
      }
    } catch (error) {
      console.error('Create complaint error:', error)
      return { success: false, message: 'Network error. Please try again.' }
    }
  }

  // Get all complaints (admin only)
  async getAllComplaints(filters: ComplaintFilters = {}): Promise<{ success: boolean; data?: ComplaintResponse; message?: string }> {
    try {
      const queryParams = new URLSearchParams()
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString())
        }
      })

      const response = await fetch(`${API_BASE_URL}/complaints?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })

      const data = await response.json()

      if (data.status === 'success') {
        return { success: true, data: data.data }
      } else {
        return { success: false, message: data.message || 'Failed to fetch complaints' }
      }
    } catch (error) {
      console.error('Get all complaints error:', error)
      return { success: false, message: 'Network error. Please try again.' }
    }
  }

  // Get user's own complaints
  async getMyComplaints(filters: ComplaintFilters = {}): Promise<{ success: boolean; data?: ComplaintResponse; message?: string }> {
    try {
      const queryParams = new URLSearchParams()
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString())
        }
      })

      const response = await fetch(`${API_BASE_URL}/complaints/my-complaints?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })

      const data = await response.json()

      if (data.status === 'success') {
        return { success: true, data: data.data }
      } else {
        return { success: false, message: data.message || 'Failed to fetch complaints' }
      }
    } catch (error) {
      console.error('Get my complaints error:', error)
      return { success: false, message: 'Network error. Please try again.' }
    }
  }

  // Get single complaint
  async getComplaint(id: string): Promise<{ success: boolean; data?: { complaint: Complaint }; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/complaints/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })

      const data = await response.json()

      if (data.status === 'success') {
        return { success: true, data: data.data }
      } else {
        return { success: false, message: data.message || 'Failed to fetch complaint' }
      }
    } catch (error) {
      console.error('Get complaint error:', error)
      return { success: false, message: 'Network error. Please try again.' }
    }
  }

  // Update complaint status (admin only)
  async updateComplaintStatus(
    id: string, 
    updateData: {
      status?: string
      assignedTo?: string
      resolutionNotes?: string
      estimatedResolutionTime?: number
    }
  ): Promise<{ success: boolean; message: string; data?: { complaint: Complaint } }> {
    try {
      const response = await fetch(`${API_BASE_URL}/complaints/${id}/status`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updateData),
      })

      const data = await response.json()

      if (data.status === 'success') {
        return { success: true, message: data.message, data: data.data }
      } else {
        return { success: false, message: data.message || 'Failed to update complaint' }
      }
    } catch (error) {
      console.error('Update complaint error:', error)
      return { success: false, message: 'Network error. Please try again.' }
    }
  }

  // Delete complaint (admin only)
  async deleteComplaint(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/complaints/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      })

      const data = await response.json()

      if (data.status === 'success') {
        return { success: true, message: data.message }
      } else {
        return { success: false, message: data.message || 'Failed to delete complaint' }
      }
    } catch (error) {
      console.error('Delete complaint error:', error)
      return { success: false, message: 'Network error. Please try again.' }
    }
  }

  // Get complaint statistics (admin only)
  async getComplaintStats(): Promise<{ 
    success: boolean; 
    data?: {
      stats: ComplaintStats
      recentComplaints: Complaint[]
      categoryStats: CategoryStat[]
      priorityStats: PriorityStat[]
    }; 
    message?: string 
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/complaints/stats/overview`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })

      const data = await response.json()

      if (data.status === 'success') {
        return { success: true, data: data.data }
      } else {
        return { success: false, message: data.message || 'Failed to fetch statistics' }
      }
    } catch (error) {
      console.error('Get stats error:', error)
      return { success: false, message: 'Network error. Please try again.' }
    }
  }
}

export const complaintService = new ComplaintService()
