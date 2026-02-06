import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";

interface ClassItem {
  id: string;
  name: string;
  section: string | null;
  academic_year: string | null;
}

interface Subject {
  id: string;
  name: string;
  class_id: string | null;
  total_marks: number | null;
  classes?: { name: string } | null;
}

interface ExamMonth {
  id: string;
  name: string;
  month_year: string;
  class_id: string | null;
  is_active: boolean | null;
  classes?: { name: string } | null;
}

const AdminClasses = () => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [examMonths, setExamMonths] = useState<ExamMonth[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialogs
  const [isClassDialogOpen, setIsClassDialogOpen] = useState(false);
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  const [isExamDialogOpen, setIsExamDialogOpen] = useState(false);

  // Editing states
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editingExam, setEditingExam] = useState<ExamMonth | null>(null);

  // Form states
  const [classForm, setClassForm] = useState({ name: "", section: "", academic_year: "" });
  const [subjectForm, setSubjectForm] = useState({ name: "", class_id: "", total_marks: "100" });
  const [examForm, setExamForm] = useState({ name: "", month_year: "", class_id: "" });

  const fetchData = async () => {
    try {
      const [classesRes, subjectsRes, examsRes] = await Promise.all([
        supabase.from("classes").select("*").order("name"),
        supabase.from("subjects").select("*, classes(name)").order("name"),
        supabase.from("exam_months").select("*, classes(name)").order("created_at", { ascending: false }),
      ]);

      setClasses(classesRes.data || []);
      setSubjects(subjectsRes.data || []);
      setExamMonths(examsRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Class handlers
  const handleClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClass) {
        const { error } = await supabase.from("classes").update(classForm).eq("id", editingClass.id);
        if (error) throw error;
        toast.success("Class updated successfully");
      } else {
        const { error } = await supabase.from("classes").insert(classForm);
        if (error) throw error;
        toast.success("Class created successfully");
      }
      setIsClassDialogOpen(false);
      setClassForm({ name: "", section: "", academic_year: "" });
      setEditingClass(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to save class");
    }
  };

  // Subject handlers
  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        name: subjectForm.name,
        class_id: subjectForm.class_id || null,
        total_marks: parseInt(subjectForm.total_marks) || 100,
      };

      if (editingSubject) {
        const { error } = await supabase.from("subjects").update(data).eq("id", editingSubject.id);
        if (error) throw error;
        toast.success("Subject updated successfully");
      } else {
        const { error } = await supabase.from("subjects").insert(data);
        if (error) throw error;
        toast.success("Subject created successfully");
      }
      setIsSubjectDialogOpen(false);
      setSubjectForm({ name: "", class_id: "", total_marks: "100" });
      setEditingSubject(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to save subject");
    }
  };

  // Exam month handlers
  const handleExamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        name: examForm.name,
        month_year: examForm.month_year,
        class_id: examForm.class_id || null,
      };

      if (editingExam) {
        const { error } = await supabase.from("exam_months").update(data).eq("id", editingExam.id);
        if (error) throw error;
        toast.success("Exam month updated successfully");
      } else {
        const { error } = await supabase.from("exam_months").insert(data);
        if (error) throw error;
        toast.success("Exam month created successfully");
      }
      setIsExamDialogOpen(false);
      setExamForm({ name: "", month_year: "", class_id: "" });
      setEditingExam(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to save exam month");
    }
  };

  return (
    <DashboardLayout role="admin" title="Classes & Subjects">
      <Tabs defaultValue="classes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="exams">Exam Months</TabsTrigger>
        </TabsList>

        {/* Classes Tab */}
        <TabsContent value="classes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>All Classes</CardTitle>
              <Dialog open={isClassDialogOpen} onOpenChange={setIsClassDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-secondary hover:bg-secondary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Class
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingClass ? "Edit Class" : "Add New Class"}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleClassSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Class Name *</Label>
                      <Input
                        value={classForm.name}
                        onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                        placeholder="e.g., Class 10"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Section</Label>
                      <Input
                        value={classForm.section}
                        onChange={(e) => setClassForm({ ...classForm, section: e.target.value })}
                        placeholder="e.g., A"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Academic Year</Label>
                      <Input
                        value={classForm.academic_year}
                        onChange={(e) => setClassForm({ ...classForm, academic_year: e.target.value })}
                        placeholder="e.g., 2024-2025"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsClassDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-secondary hover:bg-secondary/90">
                        {editingClass ? "Update" : "Create"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Class Name</TableHead>
                        <TableHead>Section</TableHead>
                        <TableHead>Academic Year</TableHead>
                        <TableHead className="w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classes.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">{c.name}</TableCell>
                          <TableCell>{c.section || "-"}</TableCell>
                          <TableCell>{c.academic_year || "-"}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingClass(c);
                                setClassForm({
                                  name: c.name,
                                  section: c.section || "",
                                  academic_year: c.academic_year || "",
                                });
                                setIsClassDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subjects Tab */}
        <TabsContent value="subjects">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>All Subjects</CardTitle>
              <Dialog open={isSubjectDialogOpen} onOpenChange={setIsSubjectDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-secondary hover:bg-secondary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Subject
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingSubject ? "Edit Subject" : "Add New Subject"}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubjectSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Subject Name *</Label>
                      <Input
                        value={subjectForm.name}
                        onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                        placeholder="e.g., Mathematics"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Class</Label>
                      <Select
                        value={subjectForm.class_id}
                        onValueChange={(value) => setSubjectForm({ ...subjectForm, class_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Total Marks</Label>
                      <Input
                        type="number"
                        value={subjectForm.total_marks}
                        onChange={(e) => setSubjectForm({ ...subjectForm, total_marks: e.target.value })}
                        placeholder="100"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsSubjectDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-secondary hover:bg-secondary/90">
                        {editingSubject ? "Update" : "Create"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Total Marks</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjects.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell>{s.classes?.name || "All Classes"}</TableCell>
                        <TableCell>{s.total_marks || 100}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingSubject(s);
                              setSubjectForm({
                                name: s.name,
                                class_id: s.class_id || "",
                                total_marks: String(s.total_marks || 100),
                              });
                              setIsSubjectDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exam Months Tab */}
        <TabsContent value="exams">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Exam Months</CardTitle>
              <Dialog open={isExamDialogOpen} onOpenChange={setIsExamDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-secondary hover:bg-secondary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Exam Month
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingExam ? "Edit Exam Month" : "Add Exam Month"}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleExamSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Exam Name *</Label>
                      <Input
                        value={examForm.name}
                        onChange={(e) => setExamForm({ ...examForm, name: e.target.value })}
                        placeholder="e.g., Mid-Term Exam"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Month & Year *</Label>
                      <Input
                        value={examForm.month_year}
                        onChange={(e) => setExamForm({ ...examForm, month_year: e.target.value })}
                        placeholder="e.g., January 2025"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Class (optional)</Label>
                      <Select
                        value={examForm.class_id}
                        onValueChange={(value) => setExamForm({ ...examForm, class_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All classes" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsExamDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-secondary hover:bg-secondary/90">
                        {editingExam ? "Update" : "Create"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Exam Name</TableHead>
                      <TableHead>Month/Year</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {examMonths.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell className="font-medium">{e.name}</TableCell>
                        <TableCell>{e.month_year}</TableCell>
                        <TableCell>{e.classes?.name || "All Classes"}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingExam(e);
                              setExamForm({
                                name: e.name,
                                month_year: e.month_year,
                                class_id: e.class_id || "",
                              });
                              setIsExamDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default AdminClasses;
