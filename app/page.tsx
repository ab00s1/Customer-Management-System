"use client"

import { useEffect, useState } from "react"
import { ComplaintForm } from "@/components/complaint-form"
import { AdminDashboard } from "@/components/admin-dashboard"
import { UserProfile } from "@/components/user-profile"
import { AuthWrapper } from "@/components/auth-wrapper"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { complaintService } from "@/lib/complaint-service"
import type { Complaint } from "@/lib/types"

function HomePageContent() {
  const { user, isAuthenticated } = useAuth()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [currentView, setCurrentView] = useState<"submit" | "view" | "admin" | "profile">("submit")

  useEffect(() => {
    if (isAuthenticated) {
      loadComplaints()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  const loadComplaints = async () => {
    let response
    if (user?.role === "admin") {
      response = await complaintService.getAllComplaints()
    } else {
      response = await complaintService.getMyComplaints()
    }
    if (response.success && response.data?.complaints) {
      setComplaints(response.data.complaints)
    } else {
      setComplaints([])
    }
  }

  const handleComplaintSubmitted = () => {
    loadComplaints()
    setCurrentView("view")
  }

  const handleComplaintUpdated = () => {
    loadComplaints()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "in-progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "resolved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  // Set initial view based on user role
  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        setCurrentView("admin")
      } else {
        setCurrentView("submit")
      }
    }
  }, [user])

  if (!isAuthenticated || !user) {
    return null // This should be handled by AuthWrapper
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Complaint Management System</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.firstName}! 
            {user.role === "admin" ? " Manage complaints and users" : " Submit and track your complaints"}
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-6">
          <div className="flex gap-2">
            {user.role === "user" && (
              <>
                <Button
                  variant={currentView === "submit" ? "default" : "outline"}
                  onClick={() => setCurrentView("submit")}
                >
                  Submit Complaint
                </Button>
                <Button 
                  variant={currentView === "view" ? "default" : "outline"} 
                  onClick={() => setCurrentView("view")}
                >
                  View Complaints ({complaints.length})
                </Button>
              </>
            )}
            
            {user.role === "admin" && (
              <Button
                variant={currentView === "admin" ? "default" : "outline"}
                onClick={() => setCurrentView("admin")}
              >
                Admin Dashboard
              </Button>
            )}
            
            <Button
              variant={currentView === "profile" ? "default" : "outline"}
              onClick={() => setCurrentView("profile")}
            >
              Profile
            </Button>
          </div>
        </div>

        {/* Content Views */}
        {currentView === "submit" && user.role === "user" && (
          <ComplaintForm onSubmitSuccess={handleComplaintSubmitted} />
        )}

        {currentView === "view" && user.role === "user" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Your Complaints</h2>
            {complaints.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No complaints submitted yet.</p>
                </CardContent>
              </Card>
            ) : (
              complaints.map((complaint) => (
                <Card key={complaint._id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{complaint.title}</CardTitle>
                        <CardDescription>
                          Submitted on {new Date(complaint.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(complaint.status)}>{complaint.status}</Badge>
                        <Badge className={getPriorityColor(complaint.priority)}>{complaint.priority}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">Category: {complaint.category}</p>
                    <p className="mb-4">{complaint.description}</p>
                    {complaint.assignedTo && (
                      <p className="text-sm text-muted-foreground">Assigned to: {complaint.assignedTo.firstName}</p>
                    )}
                    {complaint.updatedAt && (
                      <p className="text-sm text-muted-foreground">
                        Last updated: {new Date(complaint.updatedAt).toLocaleDateString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {currentView === "admin" && user.role === "admin" && (
          <AdminDashboard onComplaintUpdated={handleComplaintUpdated} />
        )}

        {currentView === "profile" && (
          <div className="flex justify-center">
            <UserProfile />
          </div>
        )}
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <AuthWrapper>
      <HomePageContent />
    </AuthWrapper>
  )
}
