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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { useTeacherData } from "@/hooks/useTeacherData";
import { ClassSubjectSelector } from "@/components/teacher/ClassSubjectSelector";

const TeacherMarks = () => {
  const {
    teacherId,
    assignedClasses,
    assignedSubjects,
    selectedClassId,
    setSelectedClassId,
    selectedSubjectId,
    setSelectedSubjectId,
    students,
    examMonths,
    loading,
    hasMultipleClasses,
  } = useTeacherData();

  const [selectedExam, setSelectedExam] = useState<string>("");
  const [marksData, setMarksData] = useState<Record<string, number>>({});
  const [existingMarks, setExistingMarks] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Fetch existing marks when exam/subject changes
  useEffect(() => {
    const fetchExistingMarks = async () => {
      if (!selectedExam || !selectedSubjectId || students.length === 0) return;

      const { data } = await supabase
        .from("marks")
        .select("id, student_id, marks_obtained")
        .eq("exam_month_id", selectedExam)
        .eq("subject_id", selectedSubjectId);

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
  }, [selectedExam, selectedSubjectId, students]);

  // Reset selections when class changes
  useEffect(() => {
    setSelectedExam("");
    setMarksData({});
    setExistingMarks({});
  }, [selectedClassId]);

  const handleMarksChange = (studentId: string, marks: string) => {
    const numMarks = parseInt(marks) || 0;
    setMarksData((prev) => ({ ...prev, [studentId]: numMarks }));
  };

  const handleSave = async () => {
    if (!selectedExam || !selectedSubjectId || !teacherId) {
      toast.error("Please select exam and subject");
      return;
    }

    setSaving(true);
    const selectedSubjectData = assignedSubjects.find((s) => s.id === selectedSubjectId);
    const totalMarks = selectedSubjectData?.total_marks || 100;

    try {
      const operations = students.map(async (student) => {
        const marksObtained = marksData[student.id] || 0;
        const existingId = existingMarks[student.id];

        if (existingId) {
          return supabase
            .from("marks")
            .update({
              marks_obtained: marksObtained,
              total_marks: totalMarks,
            })
            .eq("id", existingId);
        } else {
          return supabase.from("marks").insert({
            student_id: student.id,
            subject_id: selectedSubjectId,
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
        {/* Class and Subject Selector */}
        <ClassSubjectSelector
          classes={assignedClasses}
          subjects={assignedSubjects}
          selectedClassId={selectedClassId}
          selectedSubjectId={selectedSubjectId}
          onClassChange={setSelectedClassId}
          onSubjectChange={setSelectedSubjectId}
          showSubjectSelector={true}
          hasMultipleClasses={hasMultipleClasses}
        />

        <Card>
          <CardHeader>
            <CardTitle>Enter Student Marks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Exam Month Selector */}
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
            </div>

            {!selectedClassId && hasMultipleClasses ? (
              <div className="text-center py-8 text-muted-foreground">
                Please select a class first
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No students found in this class
              </div>
            ) : !selectedExam || !selectedSubjectId ? (
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
                              max={assignedSubjects.find((s) => s.id === selectedSubjectId)?.total_marks || 100}
                              value={marksData[student.id] ?? ""}
                              onChange={(e) => handleMarksChange(student.id, e.target.value)}
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell>
                            {assignedSubjects.find((s) => s.id === selectedSubjectId)?.total_marks || 100}
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
