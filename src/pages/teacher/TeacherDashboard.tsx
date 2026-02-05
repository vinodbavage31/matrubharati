import { useEffect, useState } from 'react';
import { DashboardLayout, navIcons } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Users, BookOpen, Calendar, GraduationCap } from 'lucide-react';

const { LayoutDashboard, ClipboardList, UserCheck, User } = navIcons;

const teacherNavItems = [
  { label: 'Dashboard', href: '/teacher', icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Marks Entry', href: '/teacher/marks', icon: <ClipboardList className="h-4 w-4" /> },
  { label: 'Attendance', href: '/teacher/attendance', icon: <UserCheck className="h-4 w-4" /> },
  { label: 'Student List', href: '/teacher/students', icon: <Users className="h-4 w-4" /> },
  { label: 'Profile', href: '/teacher/profile', icon: <User className="h-4 w-4" /> },
];

interface TeacherInfo {
  assignedClass: string;
  assignedSubjects: string[];
  totalStudents: number;
  currentExamMonth: string;
}

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [info, setInfo] = useState<TeacherInfo>({
    assignedClass: 'Not Assigned',
    assignedSubjects: [],
    totalStudents: 0,
    currentExamMonth: 'N/A',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTeacherInfo();
    }
  }, [user]);

  const fetchTeacherInfo = async () => {
    try {
      // Get teacher record
      const { data: teacher } = await supabase
        .from('teachers')
        .select('*, classes(name)')
        .eq('user_id', user?.id)
        .single();

      if (teacher) {
        // Get subjects
        const { data: teacherSubjects } = await supabase
          .from('teacher_subjects')
          .select('subjects(name)')
          .eq('teacher_id', teacher.id);

        // Get student count
        const { count: studentCount } = await supabase
          .from('students')
          .select('id', { count: 'exact', head: true })
          .eq('class_id', teacher.assigned_class_id);

        // Get latest exam month
        const { data: examMonth } = await supabase
          .from('exam_months')
          .select('name')
          .eq('class_id', teacher.assigned_class_id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        setInfo({
          assignedClass: teacher.classes?.name || 'Not Assigned',
          assignedSubjects: teacherSubjects?.map((ts: any) => ts.subjects?.name).filter(Boolean) || [],
          totalStudents: studentCount || 0,
          currentExamMonth: examMonth?.name || 'N/A',
        });
      }
    } catch (error) {
      console.error('Error fetching teacher info:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Assigned Class', value: info.assignedClass, icon: GraduationCap, color: 'text-blue-500' },
    { title: 'Total Students', value: info.totalStudents, icon: Users, color: 'text-green-500' },
    { title: 'Current Exam', value: info.currentExamMonth, icon: Calendar, color: 'text-orange-500' },
  ];

  return (
    <DashboardLayout navItems={teacherNavItems} title="Teacher Portal">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your teaching portal</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {info.assignedSubjects.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assigned Subjects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {info.assignedSubjects.map((subject) => (
                  <span
                    key={subject}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
