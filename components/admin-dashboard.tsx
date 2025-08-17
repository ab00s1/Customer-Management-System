"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Search, Filter, Eye, Edit, Trash2, RefreshCw, BarChart3, Loader2 } from "lucide-react"
import { complaintService } from "@/lib/complaint-service"
import { useAuth } from "@/lib/auth-context"
import type { Complaint, ComplaintStatus, ComplaintPriority, ComplaintCategory, ComplaintFilters, ComplaintStats } from "@/lib/types"

export interface AdminDashboardProps {
  onComplaintUpdated?: () => void
}

export function AdminDashboard({ onComplaintUpdated }: AdminDashboardProps) {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [stats, setStats] = useState<ComplaintStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState<ComplaintFilters>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  })
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [updateData, setUpdateData] = useState({
    status: "",
    assignedTo: "",
    resolutionNotes: "",
    estimatedResolutionTime: ""
  })

  const { user } = useAuth()

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchComplaints()
      fetchStats()
    }
  }, [user, filters])

  const fetchComplaints = async () => {
    try {
      setLoading(true)
      const result = await complaintService.getAllComplaints(filters)
      
      if (result.success && result.data) {
        setComplaints(result.data.complaints)
        setPagination(result.data.pagination)
      } else {
        setError(result.message || 'Failed to fetch complaints')
      }
    } catch (err) {
      setError('An error occurred while fetching complaints')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const result = await complaintService.getComplaintStats()
      if (result.success && result.data) {
        setStats(result.data.stats)
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }

  const handleFilterChange = (key: keyof ComplaintFilters, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handleUpdateComplaint = async () => {
    if (!selectedComplaint) return

    try {
      setUpdating(true)
      const result = await complaintService.updateComplaintStatus(selectedComplaint._id, {
        status: updateData.status || undefined,
        assignedTo: updateData.assignedTo || undefined,
        resolutionNotes: updateData.resolutionNotes || undefined,
        estimatedResolutionTime: updateData.estimatedResolutionTime ? parseInt(updateData.estimatedResolutionTime) : undefined
      })

      if (result.success) {
        setUpdateDialogOpen(false)
        setSelectedComplaint(null)
        setUpdateData({ status: "", assignedTo: "", resolutionNotes: "", estimatedResolutionTime: "" })
        fetchComplaints()
        fetchStats()
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('An error occurred while updating the complaint')
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteComplaint = async (id: string) => {
    if (!confirm('Are you sure you want to delete this complaint?')) return

    try {
      const result = await complaintService.deleteComplaint(id)
      if (result.success) {
        fetchComplaints()
        fetchStats()
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('An error occurred while deleting the complaint')
    }
  }

  const getStatusColor = (status: ComplaintStatus) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'resolved': 'bg-green-100 text-green-800',
      'closed': 'bg-gray-100 text-gray-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityColor = (priority: ComplaintPriority) => {
    const colors = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'urgent': 'bg-red-100 text-red-800'
    }
    return colors[priority] || 'bg-gray-100 text-gray-800'
  }

  if (user?.role !== 'admin') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <Alert>
            <AlertDescription>Access denied. Admin privileges required.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage and monitor all complaints</p>
        </div>
        <Button onClick={() => { fetchComplaints(); fetchStats(); }} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                  <p className="text-2xl font-bold">{stats.resolved}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search complaints..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filters.status || ''}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  {/* <SelectItem value="">All statuses</SelectItem> */}
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={filters.priority || ''}
                onValueChange={(value) => handleFilterChange('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  {/* <SelectItem value="">All priorities</SelectItem> */}
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={filters.category || ''}
                onValueChange={(value) => handleFilterChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  {/* <SelectItem value="">All categories</SelectItem> */}
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complaints Table */}
      <Card>
        <CardHeader>
          <CardTitle>Complaints</CardTitle>
          <CardDescription>
            Showing {complaints.length} of {pagination.totalItems} complaints
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complaints.map((complaint) => (
                    <TableRow key={complaint._id}>
                      <TableCell className="font-medium max-w-xs truncate">
                        {complaint.title}
                      </TableCell>
                      <TableCell>
                        {complaint.submittedBy.firstName} {complaint.submittedBy.lastName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{complaint.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(complaint.priority)}>
                          {complaint.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(complaint.status)}>
                          {complaint.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedComplaint(complaint)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Complaint Details</DialogTitle>
                                <DialogDescription>
                                  View and update complaint information
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label className="font-semibold">Title:</Label>
                                  <p>{complaint.title}</p>
                                </div>
                                <div>
                                  <Label className="font-semibold">Description:</Label>
                                  <p className="whitespace-pre-wrap">{complaint.description}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="font-semibold">Category:</Label>
                                    <Badge variant="outline">{complaint.category}</Badge>
                                  </div>
                                  <div>
                                    <Label className="font-semibold">Priority:</Label>
                                    <Badge className={getPriorityColor(complaint.priority)}>
                                      {complaint.priority}
                                    </Badge>
                                  </div>
                                </div>
                                <div>
                                  <Label className="font-semibold">Tags:</Label>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {complaint.tags?.map((tag, index) => (
                                      <Badge key={index} variant="secondary">{tag}</Badge>
                                    )) || <span className="text-muted-foreground">No tags</span>}
                                  </div>
                                </div>
                                {complaint.resolutionNotes && (
                                  <div>
                                    <Label className="font-semibold">Resolution Notes:</Label>
                                    <p className="whitespace-pre-wrap">{complaint.resolutionNotes}</p>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedComplaint(complaint)
                                  setUpdateData({
                                    status: complaint.status,
                                    assignedTo: complaint.assignedTo?._id || "",
                                    resolutionNotes: complaint.resolutionNotes || "",
                                    estimatedResolutionTime: complaint.estimatedResolutionTime?.toString() || ""
                                  })
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Update Complaint Status</DialogTitle>
                                <DialogDescription>
                                  Update the status and assignment of this complaint
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label>Status</Label>
                                  <Select
                                    value={updateData.status}
                                    onValueChange={(value) => setUpdateData(prev => ({ ...prev, status: value }))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">Pending</SelectItem>
                                      <SelectItem value="in-progress">In Progress</SelectItem>
                                      <SelectItem value="resolved">Resolved</SelectItem>
                                      <SelectItem value="closed">Closed</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label>Resolution Notes</Label>
                                  <Textarea
                                    placeholder="Add resolution notes..."
                                    value={updateData.resolutionNotes}
                                    onChange={(e) => setUpdateData(prev => ({ ...prev, resolutionNotes: e.target.value }))}
                                    rows={3}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Estimated Resolution Time (hours)</Label>
                                  <Input
                                    type="number"
                                    placeholder="e.g., 24"
                                    value={updateData.estimatedResolutionTime}
                                    onChange={(e) => setUpdateData(prev => ({ ...prev, estimatedResolutionTime: e.target.value }))}
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={handleUpdateComplaint}
                                    disabled={updating}
                                    className="flex-1"
                                  >
                                    {updating ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                      </>
                                    ) : (
                                      'Update Complaint'
                                    )}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => setUpdateDialogOpen(false)}
                                    disabled={updating}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteComplaint(complaint._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage >= pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
