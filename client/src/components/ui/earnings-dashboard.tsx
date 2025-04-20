
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { 
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { formatCurrency } from "@/lib/constants";

export function EarningsDashboard({ photographerId }: { photographerId?: number }) {
  interface EarningsData {
    earnings: { earnedAt: string; amount: number; photographerEarnings: number; status: string }[];
    summary: {
      totalEarnings: number;
      monthlyGrowth: number;
      platformFees: number;
      pendingPayouts: number;
      pendingBookings: number;
      completedBookings: number;
      totalBookings: number;
    };
  }

  const { data, isLoading } = useQuery<EarningsData>({
    queryKey: [`/api/earnings${photographerId ? `?photographerId=${photographerId}` : ''}`],
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-64 bg-neutral-100 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-64 bg-neutral-100 rounded-lg"></div>
          <div className="h-64 bg-neutral-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { earnings, summary } = data;

  // Format data for charts
  const monthlyData = earnings.reduce((acc: any[], curr: any) => {
    const month = new Date(curr.earnedAt).toLocaleString('default', { month: 'short' });
    const existing = acc.find(item => item.month === month);
    if (existing) {
      existing.amount += curr.amount;
      existing.earnings += curr.photographerEarnings;
    } else {
      acc.push({
        month,
        amount: curr.amount,
        earnings: curr.photographerEarnings
      });
    }
    return acc;
  }, []);

  const statusData = earnings.reduce((acc: any[], curr: any) => {
    const existing = acc.find(item => item.status === curr.status);
    if (existing) {
      existing.value += curr.amount;
    } else {
      acc.push({
        status: curr.status,
        value: curr.amount
      });
    }
    return acc;
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalEarnings)}</div>
            <p className="text-xs text-muted-foreground">+{summary.monthlyGrowth}% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.platformFees)}</div>
            <p className="text-xs text-muted-foreground">15% commission rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.pendingPayouts)}</div>
            <p className="text-xs text-muted-foreground">{summary.pendingBookings} bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.completedBookings}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((summary.completedBookings / summary.totalBookings) * 100)}% completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart width={800} height={400} data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="amount" stroke="#8884d8" name="Total Revenue" />
            <Line type="monotone" dataKey="earnings" stroke="#82ca9d" name="Net Earnings" />
          </LineChart>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Booking Status */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Status</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart width={400} height={300}>
              <Pie
                data={statusData}
                cx={200}
                cy={150}
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </CardContent>
        </Card>

        {/* Monthly Comparisons */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart width={400} height={300} data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="amount" fill="#8884d8" name="Revenue" />
            </BarChart>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
