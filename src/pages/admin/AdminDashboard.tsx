import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, BookOpen, Calendar } from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    latestExam: "N/A",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [studentsRes, teachersRes, classesRes, examsRes] = await Promise.all([
          supabase.from("students").select("id", { count: "exact", head: true }),
          supabase.from("teachers").select("id", { count: "exact", head: true }),
          supabase.from("classes").select("id", { count: "exact", head: true }),
          supabase.from("exam_months").select("name").order("created_at", { ascending: false }).limit(1),
        ]);

        setStats({
          totalStudents: studentsRes.count || 0,
          totalTeachers: teachersRes.count || 0,
          totalClasses: classesRes.count || 0,
          latestExam: examsRes.data?.[0]?.name || "No exams yet",
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <DashboardLayout role="admin" title="Dashboard Overview">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Students"
            value={loading ? "..." : stats.totalStudents}
            icon={Users}
            description="Enrolled students"
          />
          <StatCard
            title="Total Teachers"
            value={loading ? "..." : stats.totalTeachers}
            icon={GraduationCap}
            description="Active teachers"
          />
          <StatCard
            title="Total Classes"
            value={loading ? "..." : stats.totalClasses}
            icon={BookOpen}
            description="Academic classes"
          />
          <StatCard
            title="Latest Exam"
            value={loading ? "..." : stats.latestExam}
            icon={Calendar}
            description="Most recent exam"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Use the sidebar to manage students, teachers, classes, and view academic records.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-muted-foreground">All systems operational</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
