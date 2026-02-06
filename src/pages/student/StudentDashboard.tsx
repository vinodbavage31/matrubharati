import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Award, TrendingUp, Calendar } from "lucide-react";

interface StudentInfo {
  name: string;
  class_name: string;
  section: string | null;
  roll_number: string | null;
}

interface PerformanceStats {
  totalMarks: number;
  maxMarks: number;
  percentage: number;
  rank: number;
  totalStudents: number;
}

const StudentDashboard = () => {
  const { user, userRole } = useAuth();
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [stats, setStats] = useState<PerformanceStats>({
    totalMarks: 0,
    maxMarks: 0,
    percentage: 0,
    rank: 0,
    totalStudents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!user) return;

      try {
        // Get student record (either directly or via parent)
        let studentQuery = supabase.from("students").select("*, classes(name)");

        if (userRole === "parent") {
          studentQuery = studentQuery.eq("parent_id", user.id);
        } else {
          studentQuery = studentQuery.eq("user_id", user.id);
        }

        const { data: students } = await studentQuery;
        const student = students?.[0];

        if (student) {
          setStudentInfo({
            name: student.name,
            class_name: student.classes?.name || "N/A",
            section: student.section,
            roll_number: student.roll_number,
          });

          // Get latest exam marks
          const { data: examMonths } = await supabase
            .from("exam_months")
            .select("id")
            .order("created_at", { ascending: false })
            .limit(1);

          if (examMonths?.[0]) {
            // Get student's marks
            const { data: marks } = await supabase
              .from("marks")
              .select("marks_obtained, total_marks")
              .eq("student_id", student.id)
              .eq("exam_month_id", examMonths[0].id);

            const totalMarks = marks?.reduce((sum, m) => sum + (m.marks_obtained || 0), 0) || 0;
            const maxMarks = marks?.reduce((sum, m) => sum + (m.total_marks || 100), 0) || 0;
            const percentage = maxMarks > 0 ? Math.round((totalMarks / maxMarks) * 100 * 10) / 10 : 0;

            // Calculate rank
            if (student.class_id) {
              const { data: allStudents } = await supabase
                .from("students")
                .select("id")
                .eq("class_id", student.class_id);

              const { data: allMarks } = await supabase
                .from("marks")
                .select("student_id, marks_obtained, total_marks")
                .eq("exam_month_id", examMonths[0].id);

              // Calculate totals for each student
              const studentTotals: Record<string, { total: number; max: number }> = {};
              allMarks?.forEach((m) => {
                if (!studentTotals[m.student_id]) {
                  studentTotals[m.student_id] = { total: 0, max: 0 };
                }
                studentTotals[m.student_id].total += m.marks_obtained || 0;
                studentTotals[m.student_id].max += m.total_marks || 100;
              });

              // Sort by percentage
              const rankings = Object.entries(studentTotals)
                .map(([id, data]) => ({
                  id,
                  percentage: data.max > 0 ? (data.total / data.max) * 100 : 0,
                }))
                .sort((a, b) => b.percentage - a.percentage);

              const rank = rankings.findIndex((r) => r.id === student.id) + 1;

              setStats({
                totalMarks,
                maxMarks,
                percentage,
                rank: rank || 0,
                totalStudents: allStudents?.length || 0,
              });
            } else {
              setStats({ totalMarks, maxMarks, percentage, rank: 0, totalStudents: 0 });
            }
          }
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [user, userRole]);

  return (
    <DashboardLayout role="student" title="Performance Overview">
      <div className="space-y-6">
        {/* Student Info Card */}
        {studentInfo && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Student Name</p>
                  <p className="text-xl font-bold">{studentInfo.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Class & Section</p>
                  <p className="text-xl font-bold">
                    {studentInfo.class_name} {studentInfo.section ? `- ${studentInfo.section}` : ""}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Roll Number</p>
                  <p className="text-xl font-bold">{studentInfo.roll_number || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Marks"
            value={loading ? "..." : `${stats.totalMarks}/${stats.maxMarks}`}
            icon={TrendingUp}
            description="Latest exam"
          />
          <StatCard
            title="Percentage"
            value={loading ? "..." : `${stats.percentage}%`}
            icon={Award}
            description="Overall performance"
          />
          <StatCard
            title="Current Rank"
            value={loading ? "..." : stats.rank > 0 ? `#${stats.rank}` : "N/A"}
            icon={Award}
            description={stats.totalStudents > 0 ? `Out of ${stats.totalStudents} students` : ""}
          />
          <StatCard
            title="Class"
            value={studentInfo?.class_name || "..."}
            icon={User}
            description={studentInfo?.section ? `Section ${studentInfo.section}` : ""}
          />
        </div>

        {/* Info Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>Use the sidebar to view detailed marks, rankings, attendance, and progress charts.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>Contact your class teacher or school administration for any queries about your academic records.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
