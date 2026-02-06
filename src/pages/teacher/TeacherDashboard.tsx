import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, GraduationCap, Calendar } from "lucide-react";

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    assignedClass: "N/A",
    assignedSubject: "N/A",
    totalStudents: 0,
    currentExam: "N/A",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherData = async () => {
      if (!user) return;

      try {
        // Get teacher record
        const { data: teacher } = await supabase
          .from("teachers")
          .select("*, classes(name)")
          .eq("user_id", user.id)
          .single();

        if (teacher) {
          // Get assigned subjects
          const { data: teacherSubjects } = await supabase
            .from("teacher_subjects")
            .select("subjects(name)")
            .eq("teacher_id", teacher.id);

          // Count students in assigned class
          let studentCount = 0;
          if (teacher.assigned_class_id) {
            const { count } = await supabase
              .from("students")
              .select("id", { count: "exact", head: true })
              .eq("class_id", teacher.assigned_class_id);
            studentCount = count || 0;
          }

          // Get current exam
          const { data: exams } = await supabase
            .from("exam_months")
            .select("name")
            .eq("is_active", true)
            .limit(1);

          const subjectNames = teacherSubjects
            ?.map((ts: any) => ts.subjects?.name)
            .filter(Boolean)
            .join(", ") || "None assigned";

          setStats({
            assignedClass: teacher.classes?.name || "Not assigned",
            assignedSubject: subjectNames,
            totalStudents: studentCount,
            currentExam: exams?.[0]?.name || "No active exam",
          });
        }
      } catch (error) {
        console.error("Error fetching teacher data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, [user]);

  return (
    <DashboardLayout role="teacher" title="Dashboard">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Assigned Class"
            value={loading ? "..." : stats.assignedClass}
            icon={GraduationCap}
          />
          <StatCard
            title="Assigned Subject"
            value={loading ? "..." : stats.assignedSubject}
            icon={BookOpen}
          />
          <StatCard
            title="Total Students"
            value={loading ? "..." : stats.totalStudents}
            icon={Users}
          />
          <StatCard
            title="Current Exam"
            value={loading ? "..." : stats.currentExam}
            icon={Calendar}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>Use the sidebar to enter marks and manage attendance for your assigned class.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Important Notes</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <ul className="list-disc list-inside space-y-1">
                <li>Only enter marks for your assigned subjects</li>
                <li>Attendance must be updated monthly</li>
                <li>Rankings are auto-calculated</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
