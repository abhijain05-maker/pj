import { useState } from "react";
import { Link } from "wouter";
import { usePublicSearchStudent, getPublicSearchStudentQueryKey } from "@workspace/api-client-react";
import { Search, Bus, MapPin, Phone, CalendarCheck, CreditCard, ChevronRight, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { useAuth } from "@/hooks/use-auth";

export default function Parent() {
  const [query, setQuery] = useState("");
  const [searchTrigger, setSearchTrigger] = useState("");
  const { isAuthenticated } = useAuth();

  const { data: results, isLoading } = usePublicSearchStudent(
    { query: searchTrigger },
    {
      query: {
        queryKey: getPublicSearchStudentQueryKey({ query: searchTrigger }),
        enabled: searchTrigger.length > 2,
        retry: false,
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length > 2) {
      setSearchTrigger(query.trim());
    }
  };

  const StatusBadge = ({ status }: { status: string | null }) => {
    if (status === "ON_BOARD") return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> On Bus</span>;
    if (status === "OFF_BOARD") return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Off Bus / Arrived</span>;
    if (status === "ABSENT") return <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-bold">Absent</span>;
    return <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-bold">Not yet marked today</span>;
  };

  return (
    <div className="min-h-[100dvh] bg-[#fdfbf7] flex flex-col">
      <div className="bg-primary text-primary-foreground py-6 px-4 md:px-8 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <Bus className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Parent Portal</h1>
              <p className="text-primary-foreground/80 text-sm font-medium">Live school bus status tracking</p>
            </div>
          </div>
          <Link href={isAuthenticated ? "/admin" : "/login"}>
            <button className="flex items-center gap-2 bg-white/15 hover:bg-white/25 transition-colors px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm border border-white/20">
              <Lock className="w-4 h-4" />
              <span>{isAuthenticated ? "Admin Panel" : "Admin Login"}</span>
            </button>
          </Link>
        </div>
      </div>

      <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 flex flex-col gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border/50 text-center">
          <h2 className="text-xl font-bold text-foreground mb-4">Find your child's status</h2>
          <form onSubmit={handleSubmit} className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              placeholder="Enter student name or parent phone number..." 
              className="pl-12 py-6 rounded-full bg-muted/30 border-border/50 shadow-inner text-base"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground p-2 rounded-full hover:bg-primary/90 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </form>
          <p className="text-xs text-muted-foreground mt-3">Search requires at least 3 characters</p>
        </div>

        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {!isLoading && searchTrigger && results?.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-border/50 shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-foreground">No students found</h3>
            <p className="text-muted-foreground">Try a different spelling or check your phone number.</p>
          </div>
        )}

        {!isLoading && results && results.length > 0 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {results.map((student) => (
              <Card key={student.id} className="overflow-hidden border-none shadow-md rounded-2xl">
                <div className="bg-sidebar p-6 text-sidebar-foreground">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold">{student.name}</h2>
                      <div className="flex items-center gap-3 mt-2 text-sidebar-foreground/80 text-sm">
                        <span className="font-mono bg-white/10 px-2 py-0.5 rounded">Class {student.className}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {student.busStop}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-2 bg-white/5 p-3 rounded-xl border border-white/10">
                      <span className="text-xs uppercase tracking-wider font-semibold opacity-70">Today's Status</span>
                      <StatusBadge status={student.todayStatus} />
                    </div>
                  </div>
                </div>

                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/50">
                    
                    {/* Attendance History */}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-4 text-foreground font-bold">
                        <CalendarCheck className="w-5 h-5 text-primary" /> Recent Attendance
                      </div>
                      <div className="space-y-3">
                        {student.attendanceHistory.length === 0 ? (
                          <p className="text-sm text-muted-foreground italic">No recent records</p>
                        ) : (
                          student.attendanceHistory.slice(0, 5).map((record, i) => (
                            <div key={i} className="flex justify-between items-center text-sm border-b border-border/30 pb-2 last:border-0 last:pb-0">
                              <span className="text-muted-foreground">{format(parseISO(record.date), "MMM d, yyyy")}</span>
                              <StatusBadge status={record.status} />
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Fee Status */}
                    <div className="p-6 bg-muted/10">
                      <div className="flex items-center gap-2 mb-4 text-foreground font-bold">
                        <CreditCard className="w-5 h-5 text-primary" /> Monthly Fees
                      </div>
                      <div className="space-y-3">
                        {student.feeHistory.length === 0 ? (
                          <p className="text-sm text-muted-foreground italic">No fee records</p>
                        ) : (
                          student.feeHistory.slice(0, 3).map((fee, i) => (
                            <div key={i} className="flex justify-between items-center text-sm bg-white p-3 rounded-lg border border-border/50 shadow-sm">
                              <div>
                                <span className="font-mono font-bold text-foreground">{fee.month}</span>
                                <span className="ml-2 text-muted-foreground">₹{fee.amount}</span>
                              </div>
                              {fee.status === "PAID" ? (
                                <span className="text-green-600 font-bold flex items-center gap-1 text-xs">
                                  <Check className="w-3 h-3" /> PAID
                                </span>
                              ) : (
                                <span className="text-red-600 font-bold flex items-center gap-1 text-xs">
                                  UNPAID
                                </span>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                  </div>
                  
                  <div className="bg-muted/30 p-4 border-t border-border/50 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" /> Contact registered to {student.parentName}: <span className="font-mono font-medium text-foreground">{student.parentPhone}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {!searchTrigger && (
          <div className="text-center mt-auto py-8">
            <p className="text-sm text-muted-foreground">Secure parent access. No login required.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Check({ className }: { className?: string }) {
  return <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
}
