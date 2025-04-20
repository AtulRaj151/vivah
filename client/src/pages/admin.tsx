
import { useContext, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { UserContext } from "@/App";
import { AdminDashboardStats } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Calendar, DollarSign, Camera } from "lucide-react";

export default function AdminDashboard() {
  const [_, setLocation] = useLocation();
  const { user, isAuthenticated } = useContext(UserContext);

  useEffect(() => {
    if (!isAuthenticated || user?.type !== 'admin') {
      setLocation("/");
    }
  }, [isAuthenticated, user, setLocation]);

  const { data: stats } = useQuery<AdminDashboardStats>({
    queryKey: ["/api/admin/stats"],
  });

  if (!isAuthenticated || user?.type !== 'admin') {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-display font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary/10 rounded-md mr-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Total Bookings</p>
                <h3 className="text-2xl font-bold">{stats?.totalBookings || 0}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-md mr-4">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Total Revenue</p>
                <h3 className="text-2xl font-bold">₹{stats?.totalRevenue || 0}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-md mr-4">
                <Camera className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Photographers</p>
                <h3 className="text-2xl font-bold">{stats?.totalPhotographers || 0}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-md mr-4">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Customers</p>
                <h3 className="text-2xl font-bold">{stats?.totalCustomers || 0}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
