import { useEffect, useState } from 'react';
import { DashboardLayout, navIcons } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Users, GraduationCap, BookOpen, Calendar } from 'lucide-react';

const { LayoutDashboard, Settings, ClipboardList, UserCheck } = navIcons;

const adminNavItems = [
  { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Students', href: '/admin/students', icon: <Users className="h-4 w-4" /> },
  { label: 'Teachers', href: '/admin/teachers', icon: <GraduationCap className="h-4 w-4" /> },
  { label: 'Classes & Subjects', href: '/admin/classes', icon: <BookOpen className="h-4 w-4" /> },
  { label: 'Academics', href: '/admin/academics', icon: <ClipboardList className="h-4 w-4" /> },
  { label: 'Settings', href: '/admin/settings', icon: <Settings className="h-4 w-4" /> },
];

interface Stats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  latestExamMonth: string;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    latestExamMonth: 'N/A',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [studentsRes, teachersRes, classesRes, examMonthsRes] = await Promise.all([
          supabase.from('students').select('id', { count: 'exact', head: true }),
          supabase.from('teachers').select('id', { count: 'exact', head: true }),
          supabase.from('classes').select('id', { count: 'exact', head: true }),
          supabase.from('exam_months').select('name').order('created_at', { ascending: false }).limit(1),
        ]);

        setStats({
          totalStudents: studentsRes.count || 0,
          totalTeachers: teachersRes.count || 0,
          totalClasses: classesRes.count || 0,
          latestExamMonth: examMonthsRes.data?.[0]?.name || 'N/A',
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Students', value: stats.totalStudents, icon: Users, color: 'text-blue-500' },
    { title: 'Total Teachers', value: stats.totalTeachers, icon: GraduationCap, color: 'text-green-500' },
    { title: 'Total Classes', value: stats.totalClasses, icon: BookOpen, color: 'text-purple-500' },
    { title: 'Latest Exam Month', value: stats.latestExamMonth, icon: Calendar, color: 'text-orange-500' },
  ];

  return (
    <DashboardLayout navItems={adminNavItems} title="Admin Panel">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Overview</h1>
          <p className="text-muted-foreground">Welcome to the admin dashboard</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
