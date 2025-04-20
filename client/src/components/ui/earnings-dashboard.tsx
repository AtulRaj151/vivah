
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { Badge } from "./badge";
import { formatCurrency, formatDate } from "@/lib/constants";
import { BarChart, DollarSign, TrendingUp, Wallet } from "lucide-react";
import { Earnings } from "@shared/schema";

interface EarningsSummary {
  totalEarnings: number;
  platformEarnings: number;
  photographerEarnings: number;
  pendingPayouts: number;
}

interface EarningsResponse {
  earnings: Earnings[];
  summary: EarningsSummary;
}

export function EarningsDashboard({ photographerId }: { photographerId?: number }) {
  const { data, isLoading } = useQuery<EarningsResponse>({
    queryKey: ['/api/earnings', photographerId],
    queryString: photographerId ? `?photographerId=${photographerId}` : '',
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-40 bg-neutral-100 rounded-lg"></div>
        <div className="h-80 bg-neutral-100 rounded-lg"></div>
      </div>
    );
  }

  if (!data) return null;

  const { earnings, summary } = data;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary/10 rounded-md mr-4">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Total Earnings</p>
                <h3 className="text-2xl font-bold">{formatCurrency(summary.totalEarnings)}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-md mr-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Platform Earnings</p>
                <h3 className="text-2xl font-bold">{formatCurrency(summary.platformEarnings)}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-md mr-4">
                <BarChart className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Photographer Earnings</p>
                <h3 className="text-2xl font-bold">{formatCurrency(summary.photographerEarnings)}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-md mr-4">
                <Wallet className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Pending Payouts</p>
                <h3 className="text-2xl font-bold">{formatCurrency(summary.pendingPayouts)}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Earnings History</CardTitle>
          <CardDescription>Detailed view of all earnings and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Booking ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Platform Fee</TableHead>
                <TableHead>Photographer Earnings</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {earnings.map((earning) => (
                <TableRow key={earning.id}>
                  <TableCell>{formatDate(earning.earnedAt)}</TableCell>
                  <TableCell>#{earning.bookingId}</TableCell>
                  <TableCell>{formatCurrency(earning.amount)}</TableCell>
                  <TableCell>{formatCurrency(earning.platformEarnings)}</TableCell>
                  <TableCell>{formatCurrency(earning.photographerEarnings)}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={earning.status === 'paid' ? 'default' : 'outline'}
                      className={earning.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                    >
                      {earning.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
