import { useEffect, useState } from 'react';
import { DashboardLayout, navIcons } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Users } from 'lucide-react';

const { LayoutDashboard, ClipboardList, UserCheck, User } = navIcons;

const teacherNavItems = [
  { label: 'Dashboard', href: '/teacher', icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Marks Entry', href: '/teacher/marks', icon: <ClipboardList className="h-4 w-4" /> },
  { label: 'Attendance', href: '/teacher/attendance', icon: <UserCheck className="h-4 w-4" /> },
  { label: 'Student List', href: '/teacher/students', icon: <Users className="h-4 w-4" /> },
  { label: 'Profile', href: '/teacher/profile', icon: <User className="h-4 w-4" /> },
];

interface Student {
  id: string;
  name: string;
  roll_number: string | null;
  section: string | null;
}

const TeacherStudentListPage = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStudents();
    }
  }, [user]);

  const fetchStudents = async () => {
    try {
      const { data: teacher } = await supabase
        .from('teachers')
        .select('assigned_class_id')
        .eq('user_id', user?.id)
        .single();

      if (teacher?.assigned_class_id) {
        const { data: studentsData } = await supabase
          .from('students')
          .select('id, name, roll_number, section')
          .eq('class_id', teacher.assigned_class_id)
          .order('roll_number');

        if (studentsData) setStudents(studentsData);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout navItems={teacherNavItems} title="Teacher Portal">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Student List</h1>
          <p className="text-muted-foreground">Students in your assigned class</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            {loading ? <p className="text-center py-8 text-muted-foreground">Loading...</p> : students.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No students found in your class</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll No.</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Section</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.roll_number || '-'}</TableCell>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.section || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TeacherStudentListPage;
