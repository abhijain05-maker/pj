import { useState } from "react";
import { format } from "date-fns";
import { useListFees, useListPendingFees, useUpsertFee, useListStudents, getListFeesQueryKey, getListPendingFeesQueryKey } from "@workspace/api-client-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, AlertCircle, Phone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function Fees() {
  const [month, setMonth] = useState(format(new Date(), "yyyy-MM"));
  const { data: pendingFees, isLoading: loadingPending } = useListPendingFees();
  const { data: fees, isLoading: loadingFees } = useListFees({ month });
  const { data: students, isLoading: loadingStudents } = useListStudents();
  
  const upsertFee = useUpsertFee();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleMarkPaid = (studentId: number, targetMonth: string) => {
    upsertFee.mutate({
      data: { studentId, month: targetMonth, status: "PAID" }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListFeesQueryKey({ month: targetMonth }) });
        queryClient.invalidateQueries({ queryKey: getListPendingFeesQueryKey() });
        toast({ title: "Payment recorded successfully" });
      }
    });
  };

  const handleMarkUnpaid = (studentId: number, targetMonth: string) => {
    upsertFee.mutate({
      data: { studentId, month: targetMonth, status: "UNPAID" }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListFeesQueryKey({ month: targetMonth }) });
        queryClient.invalidateQueries({ queryKey: getListPendingFeesQueryKey() });
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fee Tracking</h1>
        <p className="text-muted-foreground">Manage monthly transport payments.</p>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="bg-card border border-border/50 shadow-sm p-1 rounded-xl">
          <TabsTrigger value="pending" className="rounded-lg px-6">Pending Dues</TabsTrigger>
          <TabsTrigger value="all" className="rounded-lg px-6">Monthly Register</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 m-0">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" /> Outstanding Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-border/50">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Month Due</TableHead>
                      <TableHead>Parent Contact</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingPending ? (
                       Array(3).fill(0).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-10 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-10 w-40" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : pendingFees?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <CheckCircle2 className="w-8 h-8 text-green-500 opacity-50" />
                            <p>All clear! No pending fees across all months.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      pendingFees?.map((fee, idx) => (
                        <TableRow key={`${fee.studentId}-${fee.month}-${idx}`}>
                          <TableCell>
                            <div className="font-medium">{fee.studentName}</div>
                            <div className="text-xs text-muted-foreground">Class {fee.className}</div>
                          </TableCell>
                          <TableCell>
                            <span className="bg-red-100 text-red-700 font-mono px-2 py-1 rounded text-xs font-semibold">
                              {fee.month}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{fee.parentName}</div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="w-3 h-3" /> {fee.parentPhone}
                            </div>
                          </TableCell>
                          <TableCell className="font-bold">₹{fee.amount}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              size="sm" 
                              className="bg-emerald-500 hover:bg-emerald-600 text-white"
                              onClick={() => handleMarkPaid(fee.studentId, fee.month)}
                            >
                              Mark Paid
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-4 m-0">
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Monthly Register</CardTitle>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">Select Month:</span>
                <Input 
                  type="month" 
                  value={month}
                  onChange={(e) => { if(e.target.value) setMonth(e.target.value) }}
                  className="w-auto font-mono"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-border/50 mt-4">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status ({month})</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(loadingStudents || loadingFees) ? (
                      Array(5).fill(0).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-10 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : students?.map(student => {
                      const record = fees?.find(f => f.studentId === student.id);
                      const isPaid = record?.status === "PAID";
                      
                      return (
                        <TableRow key={student.id}>
                          <TableCell>
                            <div className="font-medium">{student.name}</div>
                            <div className="text-xs text-muted-foreground">{student.className}</div>
                          </TableCell>
                          <TableCell className="font-medium">₹{student.monthlyFee}</TableCell>
                          <TableCell>
                            {isPaid ? (
                              <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                                <CheckCircle2 className="w-3 h-3" /> PAID
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">
                                <AlertCircle className="w-3 h-3" /> UNPAID
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {isPaid ? (
                              <Button variant="outline" size="sm" onClick={() => handleMarkUnpaid(student.id, month)}>
                                Undo
                              </Button>
                            ) : (
                              <Button size="sm" onClick={() => handleMarkPaid(student.id, month)} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                                Mark Paid
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
