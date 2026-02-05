import { useEffect, useState } from 'react';
import { DashboardLayout, navIcons } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Users, Save } from 'lucide-react';

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
}

interface AttendanceEntry {
  presentDays: string;
  totalDays: string;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const AttendancePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [attendanceEntries, setAttendanceEntries] = useState<Record<string, AttendanceEntry>>({});
  const [teacherId, setTeacherId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1].map(String);

  useEffect(() => {
    if (user) {
      fetchTeacherData();
    }
  }, [user]);

  useEffect(() => {
    if (selectedMonth && selectedYear) {
      fetchExistingAttendance();
    }
  }, [selectedMonth, selectedYear]);

  const fetchTeacherData = async () => {
    try {
      const { data: teacher } = await supabase
        .from('teachers')
        .select('id, assigned_class_id')
        .eq('user_id', user?.id)
        .single();

      if (teacher) {
        setTeacherId(teacher.id);

        const { data: studentsData } = await supabase
          .from('students')
          .select('id, name, roll_number')
          .eq('class_id', teacher.assigned_class_id)
          .order('roll_number');

        if (studentsData) setStudents(studentsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingAttendance = async () => {
    const { data: existingAttendance } = await supabase
      .from('attendance')
      .select('student_id, present_days, total_working_days')
      .eq('month', selectedMonth)
      .eq('year', parseInt(selectedYear));

    if (existingAttendance) {
      const entries: Record<string, AttendanceEntry> = {};
      existingAttendance.forEach((att) => {
        entries[att.student_id] = {
          presentDays: att.present_days?.toString() || '',
          totalDays: att.total_working_days?.toString() || '',
        };
      });
      setAttendanceEntries(entries);
    } else {
      setAttendanceEntries({});
    }
  };

  const handleAttendanceChange = (studentId: string, field: 'presentDays' | 'totalDays', value: string) => {
    setAttendanceEntries((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    if (!selectedMonth || !selectedYear) {
      toast({ title: 'Error', description: 'Please select month and year', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      for (const student of students) {
        const entry = attendanceEntries[student.id];
        if (entry?.presentDays !== undefined || entry?.totalDays !== undefined) {
          const { error } = await supabase.from('attendance').upsert({
            student_id: student.id,
            month: selectedMonth,
            year: parseInt(selectedYear),
            present_days: parseInt(entry?.presentDays) || 0,
            total_working_days: parseInt(entry?.totalDays) || 0,
            teacher_id: teacherId,
          }, { onConflict: 'student_id,month,year' });

          if (error) throw error;
        }
      }

      toast({ title: 'Success', description: 'Attendance saved successfully' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout navItems={teacherNavItems} title="Teacher Portal">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Attendance</h1>
          <p className="text-muted-foreground">Mark monthly attendance for your students</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select Month & Year</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Month</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger><SelectValue placeholder="Select month" /></SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month} value={month}>{month}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedMonth && selectedYear && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Student Attendance</CardTitle>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Attendance'}
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? <p className="text-center py-8 text-muted-foreground">Loading...</p> : students.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No students in your class</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll No.</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Present Days</TableHead>
                      <TableHead>Total Working Days</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>{student.roll_number || '-'}</TableCell>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            className="w-20"
                            value={attendanceEntries[student.id]?.presentDays || ''}
                            onChange={(e) => handleAttendanceChange(student.id, 'presentDays', e.target.value)}
                            min={0}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            className="w-20"
                            value={attendanceEntries[student.id]?.totalDays || ''}
                            onChange={(e) => handleAttendanceChange(student.id, 'totalDays', e.target.value)}
                            min={0}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AttendancePage;
