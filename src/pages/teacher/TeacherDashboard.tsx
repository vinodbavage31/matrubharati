import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { Users, BookOpen, GraduationCap, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TeacherInfo {
  name: string;
  email: string | null;
  assignedClasses: { id: string; name: string }[];
  assignedSubjects: { id: string; name: string }[];
  totalStudents: number;
}

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [teacherInfo, setTeacherInfo] = useState<TeacherInfo | null>(null);
  const [currentExam, setCurrentExam] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeacherData = async () => {
      if (!user) return;

      try {
        // Get teacher record
        const { data: teacher } = await supabase
          .from("teachers")
          .select("id, name, email")
          .eq("user_id", user.id)
          .single();

        if (!teacher) {
          setLoading(false);
          return;
        }

        // Fetch assigned classes
        const { data: classAssignments } = await supabase
          .from("teacher_classes")
          .select("class_id, classes(id, name)")
          .eq("teacher_id", teacher.id);

        const classes = (classAssignments || [])
          .map((ca: any) => ca.classes)
          .filter(Boolean);

        // Fetch assigned subjects
        const { data: subjectAssignments } = await supabase
          .from("teacher_subjects")
          .select("subject_id, subjects(id, name)")
          .eq("teacher_id", teacher.id);

        const subjects = (subjectAssignments || [])
          .map((sa: any) => sa.subjects)
          .filter(Boolean);

        // Count total students in assigned classes
        let totalStudents = 0;
        if (classes.length > 0) {
          const classIds = classes.map((c: any) => c.id);
          const { count } = await supabase
            .from("students")
            .select("id", { count: "exact", head: true })
            .in("class_id", classIds);
          totalStudents = count || 0;
        }

        // Get current exam
        const { data: examData } = await supabase
          .from("exam_months")
          .select("name")
          .eq("is_active", true)
          .limit(1)
          .single();

        setTeacherInfo({
          name: teacher.name,
          email: teacher.email,
          assignedClasses: classes,
          assignedSubjects: subjects,
          totalStudents,
        });
        setCurrentExam(examData?.name || null);

      } catch (error) {
        console.error("Error fetching teacher data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout role="teacher" title="Dashboard">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teacher" title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Card */}
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {teacherInfo?.name || "Teacher"}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Manage your classes, enter marks, and track student attendance from this dashboard.
            </p>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Assigned Classes"
            value={teacherInfo?.assignedClasses.length || 0}
            icon={BookOpen}
          />
          <StatCard
            title="Assigned Subjects"
            value={teacherInfo?.assignedSubjects.length || 0}
            icon={GraduationCap}
          />
          <StatCard
            title="Total Students"
            value={teacherInfo?.totalStudents || 0}
            icon={Users}
          />
          <StatCard
            title="Current Exam"
            value={currentExam || "None"}
            icon={Calendar}
          />
        </div>

        {/* Assignments Overview */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assigned Classes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {teacherInfo?.assignedClasses.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No classes assigned yet.</p>
                ) : (
                  teacherInfo?.assignedClasses.map((c) => (
                    <Badge key={c.id} variant="outline" className="text-sm">
                      {c.name}
                    </Badge>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assigned Subjects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {teacherInfo?.assignedSubjects.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No subjects assigned yet.</p>
                ) : (
                  teacherInfo?.assignedSubjects.map((s) => (
                    <Badge key={s.id} variant="secondary" className="text-sm">
                      {s.name}
                    </Badge>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
