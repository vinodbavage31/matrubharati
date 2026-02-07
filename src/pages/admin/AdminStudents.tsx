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
import { toast } from "sonner";
import { Plus, Pencil, Search, Mail, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Student {
  id: string;
  name: string;
  roll_number: string | null;
  section: string | null;
  class_id: string | null;
  email: string | null;
  mobile: string | null;
  user_id: string | null;
  classes?: { name: string } | null;
}

interface Class {
  id: string;
  name: string;
  section: string | null;
}

const AdminStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [creatingAuth, setCreatingAuth] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    roll_number: "",
    class_id: "",
    section: "",
    email: "",
    mobile: "",
  });

  const fetchData = async () => {
    try {
      const [studentsRes, classesRes] = await Promise.all([
        supabase.from("students").select("*, classes(name)").order("name"),
        supabase.from("classes").select("*").order("name"),
      ]);

      if (studentsRes.error) throw studentsRes.error;
      if (classesRes.error) throw classesRes.error;

      setStudents(studentsRes.data || []);
      setClasses(classesRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const createAuthAccount = async (entityId: string, name: string, email: string, role: "teacher" | "student") => {
    setCreatingAuth(true);
    try {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email) {
      toast.error("Email is required for student login");
      return;
    }

    try {
      let studentId = editingStudent?.id;

      if (editingStudent) {
        const { error } = await supabase
          .from("students")
          .update({
            name: formData.name,
            roll_number: formData.roll_number || null,
            class_id: formData.class_id || null,
            section: formData.section || null,
            email: formData.email || null,
            mobile: formData.mobile || null,
          })
          .eq("id", editingStudent.id);

        if (error) throw error;
        toast.success("Student updated successfully");
      } else {
        const { data, error } = await supabase.from("students").insert({
          name: formData.name,
          roll_number: formData.roll_number || null,
          class_id: formData.class_id || null,
          section: formData.section || null,
          email: formData.email || null,
          mobile: formData.mobile || null,
        }).select().single();

        if (error) throw error;
        studentId = data.id;

        // Create auth account for new student
        if (formData.email) {
          await createAuthAccount(studentId, formData.name, formData.email, "student");
        }

        toast.success("Student added successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error("Error saving student:", error);
      toast.error(error.message || "Failed to save student");
    }
  };

  const handleSendInvite = async (student: Student) => {
    if (!student.email) {
      toast.error("Student email is required");
      return;
    }
    await createAuthAccount(student.id, student.name, student.email, "student");
    fetchData();
  };

  const resetForm = () => {
    setFormData({ name: "", roll_number: "", class_id: "", section: "", email: "", mobile: "" });
    setEditingStudent(null);
  };

  const openEditDialog = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      roll_number: student.roll_number || "",
      class_id: student.class_id || "",
      section: student.section || "",
      email: student.email || "",
      mobile: student.mobile || "",
    });
    setIsDialogOpen(true);
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.roll_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout role="admin" title="Students Management">
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>All Students</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="bg-secondary hover:bg-secondary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Student
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingStudent ? "Edit Student" : "Add New Student"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Student Name *</Label>
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
                      <Label htmlFor="roll_number">Roll Number</Label>
                      <Input
                        id="roll_number"
                        value={formData.roll_number}
                        onChange={(e) =>
                          setFormData({ ...formData, roll_number: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="class">Class</Label>
                      <Select
                        value={formData.class_id}
                        onValueChange={(value) =>
                          setFormData({ ...formData, class_id: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="section">Section</Label>
                      <Input
                        id="section"
                        value={formData.section}
                        onChange={(e) =>
                          setFormData({ ...formData, section: e.target.value })
                        }
                        placeholder="e.g., A, B, C"
                      />
                    </div>
                  </div>

                  {/* Contact Section */}
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-medium mb-3">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      {editingStudent ? "Update" : "Add"} Student
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
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading students...
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No students found
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Roll Number</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.roll_number || "-"}</TableCell>
                        <TableCell>{student.classes?.name || "-"}</TableCell>
                        <TableCell>{student.section || "-"}</TableCell>
                        <TableCell>{student.email || "-"}</TableCell>
                        <TableCell>
                          {student.user_id ? (
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
                              onClick={() => openEditDialog(student)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            {!student.user_id && student.email && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleSendInvite(student)}
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

export default AdminStudents;
