import { useEffect, useState } from 'react';
import { DashboardLayout, navIcons } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Users, GraduationCap, BookOpen } from 'lucide-react';

const { LayoutDashboard, Settings, ClipboardList } = navIcons;

const adminNavItems = [
  { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Students', href: '/admin/students', icon: <Users className="h-4 w-4" /> },
  { label: 'Teachers', href: '/admin/teachers', icon: <GraduationCap className="h-4 w-4" /> },
  { label: 'Classes & Subjects', href: '/admin/classes', icon: <BookOpen className="h-4 w-4" /> },
  { label: 'Academics', href: '/admin/academics', icon: <ClipboardList className="h-4 w-4" /> },
  { label: 'Settings', href: '/admin/settings', icon: <Settings className="h-4 w-4" /> },
];

interface Mark {
  id: string;
  marks_obtained: number | null;
  total_marks: number | null;
  students: { name: string } | null;
  subjects: { name: string } | null;
  exam_months: { name: string } | null;
}

interface Attendance {
  id: string;
  month: string;
  year: number;
  present_days: number;
  total_working_days: number;
  students: { name: string } | null;
}

interface Class {
  id: string;
  name: string;
}

interface RankedStudent {
  name: string;
  totalMarks: number;
  totalPossible: number;
  percentage: number;
  rank: number;
}

const AcademicsPage = () => {
  const [marks, setMarks] = useState<Mark[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [rankings, setRankings] = useState<RankedStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedClass]);

  const fetchClasses = async () => {
    const { data } = await supabase.from('classes').select('id, name').order('name');
    if (data) setClasses(data);
  };

  const fetchData = async () => {
    setLoading(true);
    
    let marksQuery = supabase.from('marks').select('*, students(name), subjects(name), exam_months(name)');
    let attendanceQuery = supabase.from('attendance').select('*, students(name)');

    if (selectedClass !== 'all') {
      marksQuery = supabase.from('marks').select('*, students!inner(name, class_id), subjects(name), exam_months(name)').eq('students.class_id', selectedClass);
      attendanceQuery = supabase.from('attendance').select('*, students!inner(name, class_id)').eq('students.class_id', selectedClass);
    }

    const [marksRes, attendanceRes] = await Promise.all([marksQuery, attendanceQuery]);

    if (marksRes.data) {
      setMarks(marksRes.data as unknown as Mark[]);
      calculateRankings(marksRes.data as unknown as Mark[]);
    }
    if (attendanceRes.data) setAttendance(attendanceRes.data as unknown as Attendance[]);
    
    setLoading(false);
  };

  const calculateRankings = (marksData: Mark[]) => {
    const studentTotals: Record<string, { total: number; possible: number }> = {};

    marksData.forEach((mark) => {
      const studentName = mark.students?.name || 'Unknown';
      if (!studentTotals[studentName]) {
        studentTotals[studentName] = { total: 0, possible: 0 };
      }
      studentTotals[studentName].total += mark.marks_obtained || 0;
      studentTotals[studentName].possible += mark.total_marks || 0;
    });

    const ranked = Object.entries(studentTotals)
      .map(([name, totals]) => ({
        name,
        totalMarks: totals.total,
        totalPossible: totals.possible,
        percentage: totals.possible > 0 ? (totals.total / totals.possible) * 100 : 0,
        rank: 0,
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .map((student, index) => ({ ...student, rank: index + 1 }));

    setRankings(ranked);
  };

  return (
    <DashboardLayout navItems={adminNavItems} title="Admin Panel">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Academics (View Only)</h1>
            <p className="text-muted-foreground">View marks, attendance, and rankings</p>
          </div>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="marks">
          <TabsList>
            <TabsTrigger value="marks">Marks</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="rankings">Rankings</TabsTrigger>
          </TabsList>

          <TabsContent value="marks">
            <Card>
              <CardContent className="pt-6">
                {loading ? <p className="text-center py-8 text-muted-foreground">Loading...</p> : marks.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No marks recorded yet</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Exam</TableHead>
                        <TableHead>Marks</TableHead>
                        <TableHead>Percentage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {marks.map((mark) => (
                        <TableRow key={mark.id}>
                          <TableCell className="font-medium">{mark.students?.name}</TableCell>
                          <TableCell>{mark.subjects?.name}</TableCell>
                          <TableCell>{mark.exam_months?.name}</TableCell>
                          <TableCell>{mark.marks_obtained}/{mark.total_marks}</TableCell>
                          <TableCell>
                            {mark.total_marks ? ((mark.marks_obtained || 0) / mark.total_marks * 100).toFixed(1) : 0}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance">
            <Card>
              <CardContent className="pt-6">
                {loading ? <p className="text-center py-8 text-muted-foreground">Loading...</p> : attendance.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No attendance recorded yet</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Month</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>Present Days</TableHead>
                        <TableHead>Total Days</TableHead>
                        <TableHead>Percentage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendance.map((att) => (
                        <TableRow key={att.id}>
                          <TableCell className="font-medium">{att.students?.name}</TableCell>
                          <TableCell>{att.month}</TableCell>
                          <TableCell>{att.year}</TableCell>
                          <TableCell>{att.present_days}</TableCell>
                          <TableCell>{att.total_working_days}</TableCell>
                          <TableCell>
                            {att.total_working_days > 0 ? ((att.present_days / att.total_working_days) * 100).toFixed(1) : 0}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rankings">
            <Card>
              <CardContent className="pt-6">
                {loading ? <p className="text-center py-8 text-muted-foreground">Loading...</p> : rankings.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No rankings available</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Total Marks</TableHead>
                        <TableHead>Percentage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rankings.map((student) => (
                        <TableRow key={student.name}>
                          <TableCell className="font-bold">#{student.rank}</TableCell>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>{student.totalMarks}/{student.totalPossible}</TableCell>
                          <TableCell>{student.percentage.toFixed(1)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AcademicsPage;
