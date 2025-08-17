"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOut, User, Shield } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export function UserProfile() {
  const { user, logout } = useAuth()

  if (!user) return null

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />
  }

  const getRoleColor = (role: string) => {
    return role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg font-semibold">
              {getInitials(user.firstName, user.lastName)}
            </AvatarFallback>
          </Avatar>
        </div>
        <CardTitle className="text-xl">{user.firstName} {user.lastName}</CardTitle>
        <CardDescription>{user.email}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Role:</span>
          <Badge className={getRoleColor(user.role)}>
            <span className="mr-1">{getRoleIcon(user.role)}</span>
            {user.role}
          </Badge>
        </div>
        
        {user.phoneNumber && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Phone:</span>
            <span className="text-sm font-medium">{user.phoneNumber}</span>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status:</span>
          <Badge variant={user.isActive ? "default" : "secondary"}>
            {user.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
        
        {user.lastLogin && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Last Login:</span>
            <span className="text-sm font-medium">
              {new Date(user.lastLogin).toLocaleDateString()}
            </span>
          </div>
        )}
        
        <div className="pt-4">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
