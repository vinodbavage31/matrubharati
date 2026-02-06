import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ExamPerformance {
  exam: string;
  percentage: number;
}

interface SubjectMarks {
  subject: string;
  marks: number;
  total: number;
}

const StudentProgress = () => {
  const { user, userRole } = useAuth();
  const [examPerformance, setExamPerformance] = useState<ExamPerformance[]>([]);
  const [subjectMarks, setSubjectMarks] = useState<SubjectMarks[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgressData = async () => {
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
        if (!students?.[0]) return;

        const studentId = students[0].id;

        // Get all marks with exam and subject info
        const { data: marks } = await supabase
          .from("marks")
          .select("marks_obtained, total_marks, subjects(name), exam_months(name, created_at)")
          .eq("student_id", studentId);

        if (!marks) return;

        // Group by exam for line chart
        const examTotals: Record<string, { total: number; max: number; createdAt: string }> = {};
        marks.forEach((m: any) => {
          const examName = m.exam_months?.name || "Unknown";
          if (!examTotals[examName]) {
            examTotals[examName] = { total: 0, max: 0, createdAt: m.exam_months?.created_at || "" };
          }
          examTotals[examName].total += m.marks_obtained || 0;
          examTotals[examName].max += m.total_marks || 100;
        });

        const examData = Object.entries(examTotals)
          .map(([exam, data]) => ({
            exam,
            percentage: data.max > 0 ? Math.round((data.total / data.max) * 100 * 10) / 10 : 0,
            createdAt: data.createdAt,
          }))
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

        setExamPerformance(examData);

        // Get latest exam's subject-wise marks for bar chart
        const latestExam = examData[examData.length - 1]?.exam;
        if (latestExam) {
          const subjectData: SubjectMarks[] = marks
            .filter((m: any) => m.exam_months?.name === latestExam)
            .map((m: any) => ({
              subject: m.subjects?.name || "Unknown",
              marks: m.marks_obtained || 0,
              total: m.total_marks || 100,
            }));

          setSubjectMarks(subjectData);
        }
      } catch (error) {
        console.error("Error fetching progress data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, [user, userRole]);

  if (loading) {
    return (
      <DashboardLayout role="student" title="Progress Charts">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student" title="Progress Charts">
      <div className="space-y-6">
        {/* Performance Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {examPerformance.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No exam data available for chart
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={examPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="exam" fontSize={12} />
                    <YAxis domain={[0, 100]} fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="percentage"
                      stroke="hsl(var(--secondary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--secondary))" }}
                      name="Percentage"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subject-wise Marks */}
        <Card>
          <CardHeader>
            <CardTitle>Subject-wise Marks (Latest Exam)</CardTitle>
          </CardHeader>
          <CardContent>
            {subjectMarks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No subject data available for chart
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectMarks}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" fontSize={12} />
                    <YAxis domain={[0, 100]} fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="marks"
                      fill="hsl(var(--secondary))"
                      name="Marks Obtained"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="total"
                      fill="hsl(var(--muted))"
                      name="Total Marks"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentProgress;
