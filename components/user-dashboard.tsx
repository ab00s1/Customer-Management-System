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
import { Search, Filter, Eye, Plus, RefreshCw, Loader2 } from "lucide-react"
import { complaintService } from "@/lib/complaint-service"
import { useAuth } from "@/lib/auth-context"
import type { Complaint, ComplaintStatus, ComplaintPriority, ComplaintCategory, ComplaintFilters } from "@/lib/types"

interface UserDashboardProps {
  onNewComplaint?: () => void
}

export function UserDashboard({ onNewComplaint }: UserDashboardProps) {
  const [complaints, setComplaints] = useState<Complaint[]>([])
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
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchComplaints()
    }
  }, [user, filters])

  const fetchComplaints = async () => {
    try {
      setLoading(true)
      const result = await complaintService.getMyComplaints(filters)
      
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

  const handleFilterChange = (key: keyof ComplaintFilters, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
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

  const getStatusIcon = (status: ComplaintStatus) => {
    switch (status) {
      case 'pending':
        return '⏳'
      case 'in-progress':
        return '🔄'
      case 'resolved':
        return '✅'
      case 'closed':
        return '🔒'
      default:
        return '❓'
    }
  }

  if (!user) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <Alert>
            <AlertDescription>Please log in to view your complaints.</AlertDescription>
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
          <h1 className="text-3xl font-bold">My Complaints</h1>
          <p className="text-muted-foreground">Track the status of your submitted complaints</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => fetchComplaints()} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={onNewComplaint}>
            <Plus className="mr-2 h-4 w-4" />
            New Complaint
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">
                  {complaints.filter(c => c.status === 'pending').length}
                </p>
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
                <p className="text-2xl font-bold">
                  {complaints.filter(c => c.status === 'in-progress').length}
                </p>
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
                <p className="text-2xl font-bold">
                  {complaints.filter(c => c.status === 'resolved').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{complaints.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
                  <SelectItem value="">All statuses</SelectItem>
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
                  <SelectItem value="">All priorities</SelectItem>
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
                  <SelectItem value="">All categories</SelectItem>
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
          <CardTitle>My Complaints</CardTitle>
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
          ) : complaints.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-lg font-semibold mb-2">No complaints yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't submitted any complaints yet. Start by creating your first one!
              </p>
              <Button onClick={onNewComplaint}>
                <Plus className="mr-2 h-4 w-4" />
                Submit Your First Complaint
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Date Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complaints.map((complaint) => (
                    <TableRow key={complaint._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getStatusIcon(complaint.status)}</span>
                          <Badge className={getStatusColor(complaint.status)}>
                            {complaint.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium max-w-xs truncate">
                        {complaint.title}
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
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedComplaint(complaint)}
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Complaint Details</DialogTitle>
                              <DialogDescription>
                                View the details and current status of your complaint
                              </DialogDescription>
                            </DialogHeader>
                            {selectedComplaint && (
                              <div className="space-y-4">
                                <div>
                                  <Label className="font-semibold">Title:</Label>
                                  <p>{selectedComplaint.title}</p>
                                </div>
                                <div>
                                  <Label className="font-semibold">Description:</Label>
                                  <p className="whitespace-pre-wrap">{selectedComplaint.description}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="font-semibold">Category:</Label>
                                    <Badge variant="outline">{selectedComplaint.category}</Badge>
                                  </div>
                                  <div>
                                    <Label className="font-semibold">Priority:</Label>
                                    <Badge className={getPriorityColor(selectedComplaint.priority)}>
                                      {selectedComplaint.priority}
                                    </Badge>
                                  </div>
                                </div>
                                <div>
                                  <Label className="font-semibold">Status:</Label>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-lg">{getStatusIcon(selectedComplaint.status)}</span>
                                    <Badge className={getStatusColor(selectedComplaint.status)}>
                                      {selectedComplaint.status}
                                    </Badge>
                                  </div>
                                </div>
                                {selectedComplaint.tags && selectedComplaint.tags.length > 0 && (
                                  <div>
                                    <Label className="font-semibold">Tags:</Label>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                      {selectedComplaint.tags.map((tag, index) => (
                                        <Badge key={index} variant="secondary">{tag}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {selectedComplaint.assignedTo && (
                                  <div>
                                    <Label className="font-semibold">Assigned To:</Label>
                                    <p>{selectedComplaint.assignedTo.firstName} {selectedComplaint.assignedTo.lastName}</p>
                                  </div>
                                )}
                                {selectedComplaint.resolutionNotes && (
                                  <div>
                                    <Label className="font-semibold">Resolution Notes:</Label>
                                    <p className="whitespace-pre-wrap bg-muted p-3 rounded-md">
                                      {selectedComplaint.resolutionNotes}
                                    </p>
                                  </div>
                                )}
                                {selectedComplaint.estimatedResolutionTime && (
                                  <div>
                                    <Label className="font-semibold">Estimated Resolution Time:</Label>
                                    <p>{selectedComplaint.estimatedResolutionTime} hours</p>
                                  </div>
                                )}
                                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                                  <div>
                                    <Label>Submitted:</Label>
                                    <p>{new Date(selectedComplaint.createdAt).toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <Label>Last Updated:</Label>
                                    <p>{new Date(selectedComplaint.updatedAt).toLocaleString()}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
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
