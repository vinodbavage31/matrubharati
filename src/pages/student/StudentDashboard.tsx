import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { GraduationCap, Award, Calendar, TrendingUp, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface StudentInfo {
  name: string;
  className: string;
  section: string;
  rollNumber: string;
}

interface SubjectMark {
  subject: string;
  marksObtained: number;
  totalMarks: number;
  examMonth: string;
  percentage: number;
}

interface RankingEntry {
  rank: number;
  studentName: string;
  totalMarks: number;
  percentage: number;
  isCurrentStudent: boolean;
}

interface AttendanceEntry {
  month: string;
  year: number;
  presentDays: number;
  totalDays: number;
  percentage: number;
}

interface PerformanceData {
  name: string;
  percentage: number;
}

const StudentDashboard = () => {
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [marks, setMarks] = useState<SubjectMark[]>([]);
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [attendance, setAttendance] = useState<AttendanceEntry[]>([]);
  const [monthlyPerformance, setMonthlyPerformance] = useState<PerformanceData[]>([]);
  const [subjectPerformance, setSubjectPerformance] = useState<PerformanceData[]>([]);
  const [totalStats, setTotalStats] = useState({ total: 0, obtained: 0, percentage: 0, rank: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStudentData();
    }
  }, [user]);

  const fetchStudentData = async () => {
    try {
      // Get student info - check if user is student or parent
      let studentQuery;
      if (profile?.role === 'parent') {
        studentQuery = supabase
          .from('students')
          .select('*, classes(name)')
          .eq('parent_id', user?.id)
          .single();
      } else {
        studentQuery = supabase
          .from('students')
          .select('*, classes(name)')
          .eq('user_id', user?.id)
          .single();
      }

      const { data: student } = await studentQuery;

      if (student) {
        setStudentInfo({
          name: student.name,
          className: student.classes?.name || '',
          section: student.section || '',
          rollNumber: student.roll_number || '',
        });

        // Fetch marks
        const { data: marksData } = await supabase
          .from('marks')
          .select('*, subjects(name), exam_months(name)')
          .eq('student_id', student.id);

        if (marksData) {
          const processedMarks = marksData.map((mark: any) => ({
            subject: mark.subjects?.name || '',
            marksObtained: mark.marks_obtained || 0,
            totalMarks: mark.total_marks || 100,
            examMonth: mark.exam_months?.name || '',
            percentage: mark.total_marks ? (mark.marks_obtained / mark.total_marks) * 100 : 0,
          }));
          setMarks(processedMarks);

          // Calculate totals
          const totalObtained = processedMarks.reduce((sum, m) => sum + m.marksObtained, 0);
          const totalPossible = processedMarks.reduce((sum, m) => sum + m.totalMarks, 0);
          const percentage = totalPossible > 0 ? (totalObtained / totalPossible) * 100 : 0;

          // Subject performance for bar chart
          const subjectMap: Record<string, { obtained: number; total: number }> = {};
          processedMarks.forEach((m) => {
            if (!subjectMap[m.subject]) {
              subjectMap[m.subject] = { obtained: 0, total: 0 };
            }
            subjectMap[m.subject].obtained += m.marksObtained;
            subjectMap[m.subject].total += m.totalMarks;
          });

          setSubjectPerformance(
            Object.entries(subjectMap).map(([name, data]) => ({
              name,
              percentage: data.total > 0 ? (data.obtained / data.total) * 100 : 0,
            }))
          );

          // Monthly performance for line chart
          const monthMap: Record<string, { obtained: number; total: number }> = {};
          processedMarks.forEach((m) => {
            if (!monthMap[m.examMonth]) {
              monthMap[m.examMonth] = { obtained: 0, total: 0 };
            }
            monthMap[m.examMonth].obtained += m.marksObtained;
            monthMap[m.examMonth].total += m.totalMarks;
          });

          setMonthlyPerformance(
            Object.entries(monthMap).map(([name, data]) => ({
              name,
              percentage: data.total > 0 ? (data.obtained / data.total) * 100 : 0,
            }))
          );

          // Calculate rankings for the class
          const { data: classMarks } = await supabase
            .from('marks')
            .select('student_id, marks_obtained, total_marks, students(name, class_id)')
            .eq('students.class_id', student.class_id);

          if (classMarks) {
            const studentTotals: Record<string, { name: string; obtained: number; total: number }> = {};
            (classMarks as any[]).forEach((mark) => {
              const id = mark.student_id;
              if (!studentTotals[id]) {
                studentTotals[id] = { name: mark.students?.name || '', obtained: 0, total: 0 };
              }
              studentTotals[id].obtained += mark.marks_obtained || 0;
              studentTotals[id].total += mark.total_marks || 0;
            });

            const ranked = Object.entries(studentTotals)
              .map(([id, data]) => ({
                id,
                studentName: data.name,
                totalMarks: data.obtained,
                percentage: data.total > 0 ? (data.obtained / data.total) * 100 : 0,
              }))
              .sort((a, b) => b.percentage - a.percentage)
              .map((s, idx) => ({
                ...s,
                rank: idx + 1,
                isCurrentStudent: s.id === student.id,
              }));

            setRankings(ranked);

            const currentStudentRank = ranked.find((r) => r.id === student.id);
            setTotalStats({
              total: totalPossible,
              obtained: totalObtained,
              percentage,
              rank: currentStudentRank?.rank || 0,
            });
          }
        }

        // Fetch attendance
        const { data: attendanceData } = await supabase
          .from('attendance')
          .select('*')
          .eq('student_id', student.id)
          .order('year', { ascending: false })
          .order('month', { ascending: false });

        if (attendanceData) {
          setAttendance(
            attendanceData.map((att: any) => ({
              month: att.month,
              year: att.year,
              presentDays: att.present_days || 0,
              totalDays: att.total_working_days || 0,
              percentage: att.total_working_days > 0 ? (att.present_days / att.total_working_days) * 100 : 0,
            }))
          );
        }
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const overallAttendance = attendance.length > 0
    ? attendance.reduce((sum, a) => sum + a.percentage, 0) / attendance.length
    : 0;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Student Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">{profile?.full_name}</span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Performance Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Student</p>
                <p className="font-bold text-lg">{studentInfo?.name}</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Class</p>
                <p className="font-bold text-lg">{studentInfo?.className} {studentInfo?.section}</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Marks</p>
                <p className="font-bold text-lg">{totalStats.obtained}/{totalStats.total}</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Percentage</p>
                <p className="font-bold text-lg text-primary">{totalStats.percentage.toFixed(1)}%</p>
              </div>
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Current Rank</p>
                <p className="font-bold text-2xl text-primary">#{totalStats.rank}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="marks" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="marks">Subject Marks</TabsTrigger>
            <TabsTrigger value="rankings">Rankings</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="charts">Progress Charts</TabsTrigger>
          </TabsList>

          <TabsContent value="marks">
            <Card>
              <CardHeader>
                <CardTitle>Subject-wise Marks</CardTitle>
              </CardHeader>
              <CardContent>
                {marks.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No marks recorded yet</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Exam Month</TableHead>
                        <TableHead>Marks Obtained</TableHead>
                        <TableHead>Total Marks</TableHead>
                        <TableHead>Percentage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {marks.map((mark, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{mark.subject}</TableCell>
                          <TableCell>{mark.examMonth}</TableCell>
                          <TableCell>{mark.marksObtained}</TableCell>
                          <TableCell>{mark.totalMarks}</TableCell>
                          <TableCell>{mark.percentage.toFixed(1)}%</TableCell>
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
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Class Rankings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {rankings.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No rankings available</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Total Marks</TableHead>
                        <TableHead>Percentage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rankings.map((entry) => (
                        <TableRow key={entry.rank} className={entry.isCurrentStudent ? 'bg-primary/10' : ''}>
                          <TableCell className="font-bold">#{entry.rank}</TableCell>
                          <TableCell className="font-medium">
                            {entry.isCurrentStudent ? entry.studentName : '•••••'}
                          </TableCell>
                          <TableCell>{entry.isCurrentStudent ? entry.totalMarks : '-'}</TableCell>
                          <TableCell>{entry.percentage.toFixed(1)}%</TableCell>
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
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Attendance Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Overall Attendance</p>
                  <p className="font-bold text-2xl text-primary">{overallAttendance.toFixed(1)}%</p>
                </div>
                {attendance.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No attendance recorded yet</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>Present Days</TableHead>
                        <TableHead>Total Days</TableHead>
                        <TableHead>Percentage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendance.map((att, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{att.month}</TableCell>
                          <TableCell>{att.year}</TableCell>
                          <TableCell>{att.presentDays}</TableCell>
                          <TableCell>{att.totalDays}</TableCell>
                          <TableCell>{att.percentage.toFixed(1)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="charts">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  {monthlyPerformance.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No data available</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={monthlyPerformance}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                        <Line type="monotone" dataKey="percentage" stroke="hsl(var(--primary))" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Subject-wise Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  {subjectPerformance.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No data available</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={subjectPerformance}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                        <Bar dataKey="percentage" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default StudentDashboard;
