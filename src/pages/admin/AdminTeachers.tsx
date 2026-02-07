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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Pencil, Search, Mail, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface Teacher {
  id: string;
  name: string;
  email: string | null;
  mobile?: string | null;
  user_id: string | null;
  assigned_classes?: { id: string; name: string }[];
  assigned_subjects?: { id: string; name: string }[];
}

interface Class {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
  class_id: string | null;
}

const AdminTeachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [creatingAuth, setCreatingAuth] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    selectedClasses: [] as string[],
    selectedSubjects: [] as string[],
  });

  const fetchData = async () => {
    try {
      // Fetch all base data
      const [teachersRes, classesRes, subjectsRes] = await Promise.all([
        supabase.from("teachers").select("*").order("name"),
        supabase.from("classes").select("*").order("name"),
        supabase.from("subjects").select("*").order("name"),
      ]);

      if (teachersRes.error) throw teachersRes.error;
      if (classesRes.error) throw classesRes.error;
      if (subjectsRes.error) throw subjectsRes.error;

      // Fetch teacher_classes and teacher_subjects
      const [tcRes, tsRes] = await Promise.all([
        supabase.from("teacher_classes").select("teacher_id, class_id, classes(id, name)"),
        supabase.from("teacher_subjects").select("teacher_id, subject_id, subjects(id, name)"),
      ]);

      // Map assignments to teachers
      const teachersWithAssignments = (teachersRes.data || []).map((teacher) => {
        const assignedClasses = (tcRes.data || [])
          .filter((tc: any) => tc.teacher_id === teacher.id && tc.classes)
          .map((tc: any) => tc.classes);
        
        const assignedSubjects = (tsRes.data || [])
          .filter((ts: any) => ts.teacher_id === teacher.id && ts.subjects)
          .map((ts: any) => ts.subjects);

        return {
          ...teacher,
          assigned_classes: assignedClasses,
          assigned_subjects: assignedSubjects,
        };
      });

      setTeachers(teachersWithAssignments);
      setClasses(classesRes.data || []);
      setSubjects(subjectsRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load teachers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email) {
      toast.error("Email is required for teacher login");
      return;
    }

    try {
      let teacherId = editingTeacher?.id;

      if (editingTeacher) {
        // Update existing teacher
        const { error } = await supabase
          .from("teachers")
          .update({
            name: formData.name,
            email: formData.email,
          })
          .eq("id", editingTeacher.id);

        if (error) throw error;
      } else {
        // Create new teacher
        const { data, error } = await supabase
          .from("teachers")
          .insert({
            name: formData.name,
            email: formData.email,
          })
          .select()
          .single();

        if (error) throw error;
        teacherId = data.id;
      }

      if (teacherId) {
        // Update class assignments
        await supabase.from("teacher_classes").delete().eq("teacher_id", teacherId);
        if (formData.selectedClasses.length > 0) {
          const classAssignments = formData.selectedClasses.map((classId) => ({
            teacher_id: teacherId,
            class_id: classId,
          }));
          await supabase.from("teacher_classes").insert(classAssignments);
        }

        // Update subject assignments
        await supabase.from("teacher_subjects").delete().eq("teacher_id", teacherId);
        if (formData.selectedSubjects.length > 0) {
          const subjectAssignments = formData.selectedSubjects.map((subjectId) => ({
            teacher_id: teacherId,
            subject_id: subjectId,
          }));
          await supabase.from("teacher_subjects").insert(subjectAssignments);
        }

        // If new teacher without user_id, create auth account
        if (!editingTeacher && formData.email) {
          await createAuthAccount(teacherId, formData.name, formData.email, "teacher");
        }
      }

      toast.success(editingTeacher ? "Teacher updated successfully" : "Teacher added successfully");
      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error("Error saving teacher:", error);
      toast.error(error.message || "Failed to save teacher");
    }
  };

  const createAuthAccount = async (entityId: string, name: string, email: string, role: "teacher" | "student") => {
    setCreatingAuth(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke("create-user-auth", {
        body: { email, fullName: name, role, entityId },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.success) {
        toast.success(response.data.message);
      } else {
        throw new Error(response.data?.error || "Failed to create auth account");
      }
    } catch (error: any) {
      console.error("Error creating auth:", error);
      toast.error(error.message || "Failed to send invitation email");
    } finally {
      setCreatingAuth(false);
    }
  };

  const handleSendInvite = async (teacher: Teacher) => {
    if (!teacher.email) {
      toast.error("Teacher email is required");
      return;
    }
    await createAuthAccount(teacher.id, teacher.name, teacher.email, "teacher");
    fetchData();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      mobile: "",
      selectedClasses: [],
      selectedSubjects: [],
    });
    setEditingTeacher(null);
  };

  const openEditDialog = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email || "",
      mobile: "",
      selectedClasses: teacher.assigned_classes?.map((c) => c.id) || [],
      selectedSubjects: teacher.assigned_subjects?.map((s) => s.id) || [],
    });
    setIsDialogOpen(true);
  };

  const toggleClass = (classId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedClasses: prev.selectedClasses.includes(classId)
        ? prev.selectedClasses.filter((id) => id !== classId)
        : [...prev.selectedClasses, classId],
    }));
  };

  const toggleSubject = (subjectId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedSubjects: prev.selectedSubjects.includes(subjectId)
        ? prev.selectedSubjects.filter((id) => id !== subjectId)
        : [...prev.selectedSubjects, subjectId],
    }));
  };

  const filteredTeachers = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get subjects for selected classes
  const availableSubjects = subjects.filter(
    (s) => !s.class_id || formData.selectedClasses.includes(s.class_id)
  );

  return (
    <DashboardLayout role="admin" title="Teachers Management">
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>All Teachers</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="bg-secondary hover:bg-secondary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Teacher
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingTeacher ? "Edit Teacher" : "Add New Teacher"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email (required for login) *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mobile">Mobile Number</Label>
                      <Input
                        id="mobile"
                        value={formData.mobile}
                        onChange={(e) =>
                          setFormData({ ...formData, mobile: e.target.value })
                        }
                        placeholder="Optional"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Assigned Classes *</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 border rounded-md max-h-40 overflow-y-auto">
                      {classes.map((c) => (
                        <div key={c.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`class-${c.id}`}
                            checked={formData.selectedClasses.includes(c.id)}
                            onCheckedChange={() => toggleClass(c.id)}
                          />
                          <label htmlFor={`class-${c.id}`} className="text-sm cursor-pointer">
                            {c.name}
                          </label>
                        </div>
                      ))}
                      {classes.length === 0 && (
                        <p className="text-muted-foreground text-sm col-span-3">
                          No classes available. Create classes first.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Assigned Subjects</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 border rounded-md max-h-40 overflow-y-auto">
                      {availableSubjects.map((s) => (
                        <div key={s.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`subject-${s.id}`}
                            checked={formData.selectedSubjects.includes(s.id)}
                            onCheckedChange={() => toggleSubject(s.id)}
                          />
                          <label htmlFor={`subject-${s.id}`} className="text-sm cursor-pointer">
                            {s.name}
                          </label>
                        </div>
                      ))}
                      {availableSubjects.length === 0 && (
                        <p className="text-muted-foreground text-sm col-span-3">
                          {formData.selectedClasses.length === 0
                            ? "Select classes first to see available subjects."
                            : "No subjects available for selected classes."}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-secondary hover:bg-secondary/90">
                      {editingTeacher ? "Update" : "Add"} Teacher
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search teachers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading teachers...
              </div>
            ) : filteredTeachers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No teachers found
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Assigned Classes</TableHead>
                      <TableHead>Assigned Subjects</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTeachers.map((teacher) => (
                      <TableRow key={teacher.id}>
                        <TableCell className="font-medium">{teacher.name}</TableCell>
                        <TableCell>{teacher.email || "-"}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {teacher.assigned_classes?.map((c) => (
                              <Badge key={c.id} variant="outline" className="text-xs">
                                {c.name}
                              </Badge>
                            )) || "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {teacher.assigned_subjects?.map((s) => (
                              <Badge key={s.id} variant="secondary" className="text-xs">
                                {s.name}
                              </Badge>
                            )) || "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          {teacher.user_id ? (
                            <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
                          ) : (
                            <Badge variant="outline" className="text-amber-600 border-amber-600">
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(teacher)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            {!teacher.user_id && teacher.email && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleSendInvite(teacher)}
                                disabled={creatingAuth}
                                title="Send invitation email"
                              >
                                {creatingAuth ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Mail className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminTeachers;
