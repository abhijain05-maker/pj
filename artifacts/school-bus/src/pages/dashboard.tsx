import { format } from "date-fns";
import { useGetDashboardSummary, useGetAttendanceTrend, useListStudents, useUpsertAttendance, getGetDashboardSummaryQueryKey, getListAttendanceQueryKey, getGetAttendanceTrendQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { Users, CheckCircle2, XCircle, Clock, DollarSign, AlertCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary();
  const { data: trend, isLoading: loadingTrend } = useGetAttendanceTrend({ days: 14 });
  const { data: students, isLoading: loadingStudents } = useListStudents();
  const upsertAttendance = useUpsertAttendance();
  const queryClient = useQueryClient();

  const todayStr = format(new Date(), "yyyy-MM-dd");

  const handleMark = (studentId: number, status: "ON_BOARD" | "OFF_BOARD" | "ABSENT") => {
    upsertAttendance.mutate({
      data: { studentId, date: todayStr, status }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAttendanceTrendQueryKey() });
      }
    });
  };

  const statCards = [
    { title: "Total Students", value: summary?.totalStudents, icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "On Board Today", value: summary?.onBoardToday, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100" },
    { title: "Absent Today", value: summary?.absentToday, icon: XCircle, color: "text-gray-600", bg: "bg-gray-200" },
    { title: "Unmarked", value: summary?.unmarkedToday, icon: Clock, color: "text-orange-500", bg: "bg-orange-100" },
    { title: "Revenue Collected", value: summary?.revenueCollectedThisMonth ? `$${summary.revenueCollectedThisMonth}` : "$0", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-100" },
    { title: "Pending Fees", value: summary?.revenuePendingThisMonth ? `$${summary.revenuePendingThisMonth}` : "$0", icon: AlertCircle, color: "text-red-600", bg: "bg-red-100" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Morning Cockpit</h1>
        <p className="text-muted-foreground">Overview of today's transport operations. {format(new Date(), "EEEE, MMMM do")}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm hover-elevate">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className={`p-3 rounded-full ${stat.bg} ${stat.color} mb-3`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
              {loadingSummary ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold">{stat.value}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm border-none">
          <CardHeader>
            <CardTitle>14-Day Attendance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {loadingTrend ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorOnBoard" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9ca3af" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#9ca3af" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(val) => format(new Date(val), "MMM d")}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                      labelFormatter={(val) => format(new Date(val as string), "EEEE, MMMM d")}
                    />
                    <Legend iconType="circle" />
                    <Area type="monotone" dataKey="onBoard" name="On Board" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorOnBoard)" />
                    <Area type="monotone" dataKey="absent" name="Absent" stroke="#9ca3af" strokeWidth={2} fillOpacity={1} fill="url(#colorAbsent)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none flex flex-col h-full">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Today's Pending</span>
              <span className="bg-orange-100 text-orange-700 py-1 px-2 rounded-full text-xs font-bold">
                {summary?.unmarkedToday || 0} left
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            {/* Displaying unmarked students is a bit tricky if we don't have an endpoint for it directly, 
                but we can show a placeholder or just say "Go to Attendance" */}
            <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4 text-muted-foreground">
              <Clock className="w-12 h-12 opacity-20" />
              <p>Mark attendance quickly from the attendance page to keep the dashboard updated.</p>
              <Button asChild className="w-full">
                <a href="/admin/attendance">Go to Attendance</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
