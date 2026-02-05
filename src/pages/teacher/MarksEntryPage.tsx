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

interface Subject {
  id: string;
  name: string;
  total_marks: number;
}

interface ExamMonth {
  id: string;
  name: string;
}

interface MarkEntry {
  studentId: string;
  marksObtained: string;
}

const MarksEntryPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [examMonths, setExamMonths] = useState<ExamMonth[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedExamMonth, setSelectedExamMonth] = useState<string>('');
  const [markEntries, setMarkEntries] = useState<Record<string, string>>({});
  const [teacherId, setTeacherId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTeacherData();
    }
  }, [user]);

  useEffect(() => {
    if (selectedSubject && selectedExamMonth) {
      fetchExistingMarks();
    }
  }, [selectedSubject, selectedExamMonth]);

  const fetchTeacherData = async () => {
    try {
      const { data: teacher } = await supabase
        .from('teachers')
        .select('id, assigned_class_id')
        .eq('user_id', user?.id)
        .single();

      if (teacher) {
        setTeacherId(teacher.id);

        const [studentsRes, subjectsRes, examMonthsRes] = await Promise.all([
          supabase.from('students').select('id, name, roll_number').eq('class_id', teacher.assigned_class_id).order('roll_number'),
          supabase.from('subjects').select('id, name, total_marks').eq('class_id', teacher.assigned_class_id),
          supabase.from('exam_months').select('id, name').eq('class_id', teacher.assigned_class_id).eq('is_active', true),
        ]);

        if (studentsRes.data) setStudents(studentsRes.data);
        if (subjectsRes.data) setSubjects(subjectsRes.data);
        if (examMonthsRes.data) setExamMonths(examMonthsRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingMarks = async () => {
    const { data: existingMarks } = await supabase
      .from('marks')
      .select('student_id, marks_obtained')
      .eq('subject_id', selectedSubject)
      .eq('exam_month_id', selectedExamMonth);

    if (existingMarks) {
      const entries: Record<string, string> = {};
      existingMarks.forEach((mark) => {
        entries[mark.student_id] = mark.marks_obtained?.toString() || '';
      });
      setMarkEntries(entries);
    }
  };

  const handleMarksChange = (studentId: string, value: string) => {
    setMarkEntries((prev) => ({ ...prev, [studentId]: value }));
  };

  const handleSave = async () => {
    if (!selectedSubject || !selectedExamMonth) {
      toast({ title: 'Error', description: 'Please select subject and exam month', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const subject = subjects.find((s) => s.id === selectedSubject);
    const totalMarks = subject?.total_marks || 100;

    try {
      for (const student of students) {
        const marks = markEntries[student.id];
        if (marks !== undefined && marks !== '') {
          const { error } = await supabase.from('marks').upsert({
            student_id: student.id,
            subject_id: selectedSubject,
            exam_month_id: selectedExamMonth,
            marks_obtained: parseFloat(marks),
            total_marks: totalMarks,
            teacher_id: teacherId,
          }, { onConflict: 'student_id,subject_id,exam_month_id' });

          if (error) throw error;
        }
      }

      toast({ title: 'Success', description: 'Marks saved successfully' });
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
          <h1 className="text-2xl font-bold">Marks Entry</h1>
          <p className="text-muted-foreground">Enter marks for your students</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select Subject & Exam</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Exam Month</Label>
                <Select value={selectedExamMonth} onValueChange={setSelectedExamMonth}>
                  <SelectTrigger><SelectValue placeholder="Select exam month" /></SelectTrigger>
                  <SelectContent>
                    {examMonths.map((exam) => (
                      <SelectItem key={exam.id} value={exam.id}>{exam.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedSubject && selectedExamMonth && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Student Marks</CardTitle>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Marks'}
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
                      <TableHead>Marks Obtained</TableHead>
                      <TableHead>Total Marks</TableHead>
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
                            className="w-24"
                            value={markEntries[student.id] || ''}
                            onChange={(e) => handleMarksChange(student.id, e.target.value)}
                            max={subjects.find((s) => s.id === selectedSubject)?.total_marks || 100}
                            min={0}
                          />
                        </TableCell>
                        <TableCell>{subjects.find((s) => s.id === selectedSubject)?.total_marks || 100}</TableCell>
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

export default MarksEntryPage;
