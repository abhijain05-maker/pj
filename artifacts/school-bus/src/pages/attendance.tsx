import { useState } from "react";
import { format } from "date-fns";
import { useListStudents, useListAttendance, useUpsertAttendance, getListAttendanceQueryKey } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Search, Calendar as CalendarIcon, Check, X, Minus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function Attendance() {
  const [date, setDate] = useState(new Date());
  const dateStr = format(date, "yyyy-MM-dd");
  const [search, setSearch] = useState("");
  
  const { data: students, isLoading: loadingStudents } = useListStudents();
  const { data: attendance, isLoading: loadingAttendance } = useListAttendance({ date: dateStr });
  
  const upsertAttendance = useUpsertAttendance();
  const queryClient = useQueryClient();

  const handleMark = (studentId: number, status: "ON_BOARD" | "OFF_BOARD" | "ABSENT") => {
    upsertAttendance.mutate({
      data: { studentId, date: dateStr, status }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAttendanceQueryKey({ date: dateStr }) });
      }
    });
  };

  const filteredStudents = students?.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.busStop.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Boarding Status</h1>
          <p className="text-muted-foreground">Mark student attendance for the morning route.</p>
        </div>
        <div className="flex items-center gap-3 bg-card px-4 py-2 rounded-xl shadow-sm border border-border/50">
          <CalendarIcon className="w-5 h-5 text-primary" />
          <Input 
            type="date" 
            value={dateStr}
            onChange={(e) => {
              if (e.target.value) setDate(new Date(e.target.value));
            }}
            className="border-none shadow-none focus-visible:ring-0 p-0 h-auto font-medium"
          />
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input 
          placeholder="Filter by name or bus stop..." 
          className="pl-12 py-6 bg-card border-none shadow-sm rounded-xl text-lg"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border/50 overflow-hidden">
        {(loadingStudents || loadingAttendance) ? (
          <div className="p-4 space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : filteredStudents?.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No students found.
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {filteredStudents?.map((student) => {
              const record = attendance?.find(a => a.studentId === student.id);
              const status = record?.status;

              return (
                <div key={student.id} className={cn(
                  "p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors",
                  status === "ON_BOARD" ? "bg-green-50/30" :
                  status === "OFF_BOARD" ? "bg-red-50/30" :
                  status === "ABSENT" ? "bg-gray-50" : ""
                )}>
                  <div>
                    <div className="font-semibold text-lg">{student.name}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">{student.className}</span>
                      <span>•</span>
                      <span>{student.busStop}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-lg border border-border/50">
                    <button
                      onClick={() => handleMark(student.id, "ON_BOARD")}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all",
                        status === "ON_BOARD" 
                          ? "bg-green-500 text-white shadow-sm scale-105" 
                          : "text-green-700 hover:bg-green-100"
                      )}
                    >
                      <Check className="w-4 h-4" /> Boarded
                    </button>
                    <button
                      onClick={() => handleMark(student.id, "OFF_BOARD")}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all",
                        status === "OFF_BOARD" 
                          ? "bg-red-500 text-white shadow-sm scale-105" 
                          : "text-red-700 hover:bg-red-100"
                      )}
                    >
                      <X className="w-4 h-4" /> Off
                    </button>
                    <button
                      onClick={() => handleMark(student.id, "ABSENT")}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all",
                        status === "ABSENT" 
                          ? "bg-gray-500 text-white shadow-sm scale-105" 
                          : "text-gray-600 hover:bg-gray-200"
                      )}
                    >
                      <Minus className="w-4 h-4" /> Absent
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
