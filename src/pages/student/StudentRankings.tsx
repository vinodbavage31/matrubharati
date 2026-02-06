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

interface Ranking {
  rank: number;
  student_name: string;
  total_marks: number;
  percentage: number;
  isCurrentStudent: boolean;
}

interface ExamMonth {
  id: string;
  name: string;
}

const StudentRankings = () => {
  const { user, userRole } = useAuth();
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [examMonths, setExamMonths] = useState<ExamMonth[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>("");
  const [studentId, setStudentId] = useState<string | null>(null);
  const [classId, setClassId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!user) return;

      try {
        // Get student info
        let studentQuery = supabase.from("students").select("id, class_id");
        if (userRole === "parent") {
          studentQuery = studentQuery.eq("parent_id", user.id);
        } else {
          studentQuery = studentQuery.eq("user_id", user.id);
        }

        const { data: students } = await studentQuery;
        if (students?.[0]) {
          setStudentId(students[0].id);
          setClassId(students[0].class_id);
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
    const fetchRankings = async () => {
      if (!classId || !selectedExam) return;

      // Get all students in the class
      const { data: students } = await supabase
        .from("students")
        .select("id, name")
        .eq("class_id", classId);

      if (!students) return;

      // Get all marks for the exam
      const { data: marks } = await supabase
        .from("marks")
        .select("student_id, marks_obtained, total_marks")
        .eq("exam_month_id", selectedExam);

      // Calculate totals for each student
      const studentTotals: Record<string, { name: string; total: number; max: number }> = {};

      students.forEach((s) => {
        studentTotals[s.id] = { name: s.name, total: 0, max: 0 };
      });

      marks?.forEach((m) => {
        if (studentTotals[m.student_id]) {
          studentTotals[m.student_id].total += m.marks_obtained || 0;
          studentTotals[m.student_id].max += m.total_marks || 100;
        }
      });

      // Sort by percentage and create rankings
      const rankingsArr = Object.entries(studentTotals)
        .map(([id, data]) => ({
          id,
          student_name: data.name,
          total_marks: data.total,
          percentage: data.max > 0 ? Math.round((data.total / data.max) * 100 * 10) / 10 : 0,
          rank: 0,
          isCurrentStudent: id === studentId,
        }))
        .sort((a, b) => b.percentage - a.percentage)
        .map((s, idx) => ({ ...s, rank: idx + 1 }));

      setRankings(rankingsArr);
    };

    fetchRankings();
  }, [classId, selectedExam, studentId]);

  return (
    <DashboardLayout role="student" title="Class Rankings">
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Class Ranking</CardTitle>
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
            ) : rankings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No rankings available for selected exam
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Rank</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Total Marks</TableHead>
                      <TableHead>Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rankings.map((r) => (
                      <TableRow
                        key={r.student_name + r.rank}
                        className={r.isCurrentStudent ? "bg-secondary/10" : ""}
                      >
                        <TableCell>
                          <Badge variant={r.rank <= 3 ? "default" : "outline"}>
                            #{r.rank}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {r.student_name}
                          {r.isCurrentStudent && (
                            <span className="ml-2 text-xs text-secondary">(You)</span>
                          )}
                        </TableCell>
                        <TableCell>{r.total_marks}</TableCell>
                        <TableCell>{r.percentage}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <p className="mt-4 text-sm text-muted-foreground">
              Note: Only names and rankings are shown. Subject-wise marks of other students are not visible.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentRankings;
