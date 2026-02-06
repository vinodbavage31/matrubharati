import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Save } from "lucide-react";

interface Student {
  id: string;
  name: string;
  roll_number: string | null;
}

interface Subject {
  id: string;
  name: string;
  total_marks: number | null;
}

interface ExamMonth {
  id: string;
  name: string;
}

interface MarkEntry {
  student_id: string;
  marks_obtained: number;
}

const TeacherMarks = () => {
  const { user } = useAuth();
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [classId, setClassId] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [examMonths, setExamMonths] = useState<ExamMonth[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedExam, setSelectedExam] = useState<string>("");
  const [marksData, setMarksData] = useState<Record<string, number>>({});
  const [existingMarks, setExistingMarks] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchTeacherData = async () => {
      if (!user) return;

      try {
        const { data: teacher } = await supabase
          .from("teachers")
          .select("id, assigned_class_id")
          .eq("user_id", user.id)
          .single();

        if (teacher) {
          setTeacherId(teacher.id);
          setClassId(teacher.assigned_class_id);

          // Fetch students in assigned class
          if (teacher.assigned_class_id) {
            const { data: studentsData } = await supabase
              .from("students")
              .select("id, name, roll_number")
              .eq("class_id", teacher.assigned_class_id)
              .order("roll_number");
            setStudents(studentsData || []);
          }

          // Fetch assigned subjects
          const { data: teacherSubjects } = await supabase
            .from("teacher_subjects")
            .select("subjects(id, name, total_marks)")
            .eq("teacher_id", teacher.id);

          const subjectsList = teacherSubjects
            ?.map((ts: any) => ts.subjects)
            .filter(Boolean) || [];
          setSubjects(subjectsList);

          // Fetch exam months
          const { data: exams } = await supabase
            .from("exam_months")
            .select("id, name")
            .order("created_at", { ascending: false });
          setExamMonths(exams || []);
        }
      } catch (error) {
        console.error("Error fetching teacher data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, [user]);

  // Fetch existing marks when exam/subject changes
  useEffect(() => {
    const fetchExistingMarks = async () => {
      if (!selectedExam || !selectedSubject || students.length === 0) return;

      const { data } = await supabase
        .from("marks")
        .select("id, student_id, marks_obtained")
        .eq("exam_month_id", selectedExam)
        .eq("subject_id", selectedSubject);

      const marksMap: Record<string, number> = {};
      const idsMap: Record<string, string> = {};

      data?.forEach((m) => {
        if (m.student_id) {
          marksMap[m.student_id] = m.marks_obtained || 0;
          idsMap[m.student_id] = m.id;
        }
      });

      setMarksData(marksMap);
      setExistingMarks(idsMap);
    };

    fetchExistingMarks();
  }, [selectedExam, selectedSubject, students]);

  const handleMarksChange = (studentId: string, marks: string) => {
    const numMarks = parseInt(marks) || 0;
    setMarksData((prev) => ({ ...prev, [studentId]: numMarks }));
  };

  const handleSave = async () => {
    if (!selectedExam || !selectedSubject || !teacherId) {
      toast.error("Please select exam and subject");
      return;
    }

    setSaving(true);
    const selectedSubjectData = subjects.find((s) => s.id === selectedSubject);
    const totalMarks = selectedSubjectData?.total_marks || 100;

    try {
      const operations = students.map(async (student) => {
        const marksObtained = marksData[student.id] || 0;
        const existingId = existingMarks[student.id];

        if (existingId) {
          // Update
          return supabase
            .from("marks")
            .update({
              marks_obtained: marksObtained,
              total_marks: totalMarks,
            })
            .eq("id", existingId);
        } else {
          // Insert
          return supabase.from("marks").insert({
            student_id: student.id,
            subject_id: selectedSubject,
            exam_month_id: selectedExam,
            teacher_id: teacherId,
            marks_obtained: marksObtained,
            total_marks: totalMarks,
          });
        }
      });

      await Promise.all(operations);
      toast.success("Marks saved successfully");
    } catch (error: any) {
      console.error("Error saving marks:", error);
      toast.error(error.message || "Failed to save marks");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="teacher" title="Marks Entry">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teacher" title="Marks Entry">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Enter Student Marks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <div className="w-48">
                <Label>Exam Month</Label>
                <Select value={selectedExam} onValueChange={setSelectedExam}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {examMonths.map((e) => (
                      <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-48">
                <Label>Subject</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {students.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No students found in your assigned class
              </div>
            ) : !selectedExam || !selectedSubject ? (
              <div className="text-center py-8 text-muted-foreground">
                Please select an exam and subject to enter marks
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Roll No.</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead className="w-[150px]">Marks Obtained</TableHead>
                        <TableHead className="w-[100px]">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>{student.roll_number || "-"}</TableCell>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max={subjects.find((s) => s.id === selectedSubject)?.total_marks || 100}
                              value={marksData[student.id] || ""}
                              onChange={(e) => handleMarksChange(student.id, e.target.value)}
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell>
                            {subjects.find((s) => s.id === selectedSubject)?.total_marks || 100}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-secondary hover:bg-secondary/90"
                >
                  {saving ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Marks
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TeacherMarks;
