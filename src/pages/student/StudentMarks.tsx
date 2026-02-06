import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

interface Mark {
  id: string;
  marks_obtained: number | null;
  total_marks: number | null;
  subjects: { name: string } | null;
  exam_months: { name: string } | null;
}

interface ExamMonth {
  id: string;
  name: string;
}

const StudentMarks = () => {
  const { user, userRole } = useAuth();
  const [marks, setMarks] = useState<Mark[]>([]);
  const [examMonths, setExamMonths] = useState<ExamMonth[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>("");
  const [studentId, setStudentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!user) return;

      try {
        // Get student id
        let studentQuery = supabase.from("students").select("id");
        if (userRole === "parent") {
          studentQuery = studentQuery.eq("parent_id", user.id);
        } else {
          studentQuery = studentQuery.eq("user_id", user.id);
        }

        const { data: students } = await studentQuery;
        if (students?.[0]) {
          setStudentId(students[0].id);
        }

        // Get exam months
        const { data: exams } = await supabase
          .from("exam_months")
          .select("id, name")
          .order("created_at", { ascending: false });
        setExamMonths(exams || []);

        if (exams?.[0]) {
          setSelectedExam(exams[0].id);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [user, userRole]);

  useEffect(() => {
    const fetchMarks = async () => {
      if (!studentId || !selectedExam) return;

      const { data } = await supabase
        .from("marks")
        .select("*, subjects(name), exam_months(name)")
        .eq("student_id", studentId)
        .eq("exam_month_id", selectedExam);

      setMarks(data || []);
    };

    fetchMarks();
  }, [studentId, selectedExam]);

  // Calculate totals
  const totalObtained = marks.reduce((sum, m) => sum + (m.marks_obtained || 0), 0);
  const totalMax = marks.reduce((sum, m) => sum + (m.total_marks || 100), 0);
  const overallPercentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100 * 10) / 10 : 0;

  return (
    <DashboardLayout role="student" title="Subject-wise Marks">
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your Marks</CardTitle>
            <div className="w-48">
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
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : marks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No marks found for selected exam
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Exam</TableHead>
                        <TableHead>Marks Obtained</TableHead>
                        <TableHead>Total Marks</TableHead>
                        <TableHead>Percentage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {marks.map((m) => {
                        const pct = m.total_marks
                          ? Math.round(((m.marks_obtained || 0) / m.total_marks) * 100)
                          : 0;
                        return (
                          <TableRow key={m.id}>
                            <TableCell className="font-medium">{m.subjects?.name || "-"}</TableCell>
                            <TableCell>{m.exam_months?.name || "-"}</TableCell>
                            <TableCell>{m.marks_obtained || 0}</TableCell>
                            <TableCell>{m.total_marks || 100}</TableCell>
                            <TableCell>
                              <Badge variant={pct >= 60 ? "default" : pct >= 40 ? "secondary" : "destructive"}>
                                {pct}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Summary */}
                <div className="mt-4 p-4 bg-muted/50 rounded-lg flex flex-wrap gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Marks</p>
                    <p className="text-xl font-bold">{totalObtained}/{totalMax}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Overall Percentage</p>
                    <p className="text-xl font-bold">{overallPercentage}%</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentMarks;
