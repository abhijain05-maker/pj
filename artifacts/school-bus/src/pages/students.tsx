import { useState } from "react";
import { useListStudents, useCreateStudent, useUpdateStudent, useDeleteStudent, getListStudentsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit2, Trash2, MapPin, User as UserIcon, Phone } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

const studentSchema = z.object({
  name: z.string().min(2, "Name is required"),
  className: z.string().min(1, "Class is required"),
  busStop: z.string().min(2, "Bus stop is required"),
  parentName: z.string().min(2, "Parent name is required"),
  parentPhone: z.string().min(5, "Valid phone required"),
  monthlyFee: z.coerce.number().min(0, "Fee must be positive"),
});

export default function Students() {
  const [search, setSearch] = useState("");
  const { data: students, isLoading } = useListStudents({ search: search || undefined });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  const deleteStudent = useDeleteStudent();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editStudentId, setEditStudentId] = useState<number | null>(null);

  const form = useForm<z.infer<typeof studentSchema>>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: "", className: "", busStop: "", parentName: "", parentPhone: "", monthlyFee: 0
    }
  });

  const onSubmit = (data: z.infer<typeof studentSchema>) => {
    if (editStudentId) {
      updateStudent.mutate({ id: editStudentId, data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey() });
          setEditStudentId(null);
          toast({ title: "Student updated" });
        }
      });
    } else {
      createStudent.mutate({ data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey() });
          setIsAddOpen(false);
          form.reset();
          toast({ title: "Student added" });
        }
      });
    }
  };

  const handleDelete = (id: number) => {
    deleteStudent.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey() });
        toast({ title: "Student deleted" });
      }
    });
  };

  const openEdit = (student: any) => {
    form.reset({
      name: student.name,
      className: student.className,
      busStop: student.busStop,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      monthlyFee: student.monthlyFee
    });
    setEditStudentId(student.id);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roster</h1>
          <p className="text-muted-foreground">Manage students, bus stops, and parent contacts.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if(!open) form.reset(); }}>
          <DialogTrigger asChild>
            <Button className="shrink-0 gap-2">
              <Plus className="w-4 h-4" /> Add Student
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Student Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                  )} />
                  <FormField control={form.control} name="className" render={({ field }) => (
                    <FormItem><FormLabel>Class</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                  )} />
                  <FormField control={form.control} name="busStop" render={({ field }) => (
                    <FormItem className="col-span-2"><FormLabel>Bus Stop</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                  )} />
                  <FormField control={form.control} name="parentName" render={({ field }) => (
                    <FormItem><FormLabel>Parent Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                  )} />
                  <FormField control={form.control} name="parentPhone" render={({ field }) => (
                    <FormItem><FormLabel>Parent Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                  )} />
                  <FormField control={form.control} name="monthlyFee" render={({ field }) => (
                    <FormItem className="col-span-2"><FormLabel>Monthly Fee (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage/></FormItem>
                  )} />
                </div>
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={createStudent.isPending}>Save Student</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editStudentId} onOpenChange={(open) => { if(!open) setEditStudentId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Student Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                )} />
                <FormField control={form.control} name="className" render={({ field }) => (
                  <FormItem><FormLabel>Class</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                )} />
                <FormField control={form.control} name="busStop" render={({ field }) => (
                  <FormItem className="col-span-2"><FormLabel>Bus Stop</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                )} />
                <FormField control={form.control} name="parentName" render={({ field }) => (
                  <FormItem><FormLabel>Parent Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                )} />
                <FormField control={form.control} name="parentPhone" render={({ field }) => (
                  <FormItem><FormLabel>Parent Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                )} />
                <FormField control={form.control} name="monthlyFee" render={({ field }) => (
                  <FormItem className="col-span-2"><FormLabel>Monthly Fee (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage/></FormItem>
                )} />
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={updateStudent.isPending}>Update Student</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, parent, or stop..." 
              className="pl-9 bg-muted/50 border-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/50">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Bus Stop</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-10 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : students?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                      No students found.
                    </TableCell>
                  </TableRow>
                ) : (
                  students?.map((student) => (
                    <TableRow key={student.id} className="group">
                      <TableCell>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-xs text-muted-foreground">Class {student.className}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm">
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                          {student.busStop}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{student.parentName}</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="w-3 h-3" /> {student.parentPhone}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        ₹{student.monthlyFee}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(student)} className="h-8 w-8">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Student</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove {student.name}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(student.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
