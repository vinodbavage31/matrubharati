import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Mark {
  id: string;
  marks_obtained: number | null;
  total_marks: number | null;
  students: { name: string; roll_number: string | null } | null;
  subjects: { name: string } | null;
  exam_months: { name: string } | null;
}

interface Attendance {
  id: string;
  month: string;
  year: number;
  present_days: number | null;
  total_working_days: number | null;
  students: { name: string; roll_number: string | null } | null;
}

interface StudentRanking {
  student_name: string;
  roll_number: string | null;
  total_marks: number;
  percentage: number;
  rank: number;
}

interface ClassItem {
  id: string;
  name: string;
}

interface ExamMonth {
  id: string;
  name: string;
}

const AdminAcademics = () => {
  const [marks, setMarks] = useState<Mark[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [rankings, setRankings] = useState<StudentRanking[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [examMonths, setExamMonths] = useState<ExamMonth[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedExam, setSelectedExam] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFilters = async () => {
      const [classesRes, examsRes] = await Promise.all([
        supabase.from("classes").select("id, name").order("name"),
        supabase.from("exam_months").select("id, name").order("created_at", { ascending: false }),
      ]);
      setClasses(classesRes.data || []);
      setExamMonths(examsRes.data || []);
      setLoading(false);
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    const fetchMarks = async () => {
      if (!selectedExam) return;

      let query = supabase
        .from("marks")
        .select("*, students(name, roll_number, class_id), subjects(name), exam_months(name)")
        .eq("exam_month_id", selectedExam);

      const { data, error } = await query;
      if (!error && data) {
        // Filter by class if selected
        const filtered = selectedClass
          ? data.filter((m: any) => m.students?.class_id === selectedClass)
          : data;
        setMarks(filtered);

        // Calculate rankings
        const studentTotals: Record<string, { name: string; roll: string | null; total: number; maxTotal: number }> = {};
        filtered.forEach((m: any) => {
          const studentId = m.student_id;
          if (!studentTotals[studentId]) {
            studentTotals[studentId] = {
              name: m.students?.name || "Unknown",
              roll: m.students?.roll_number,
              total: 0,
              maxTotal: 0,
            };
          }
          studentTotals[studentId].total += m.marks_obtained || 0;
          studentTotals[studentId].maxTotal += m.total_marks || 100;
        });

        const rankingsArr = Object.values(studentTotals)
          .map((s) => ({
            student_name: s.name,
            roll_number: s.roll,
            total_marks: s.total,
            percentage: s.maxTotal > 0 ? Math.round((s.total / s.maxTotal) * 100 * 10) / 10 : 0,
            rank: 0,
          }))
          .sort((a, b) => b.percentage - a.percentage)
          .map((s, idx) => ({ ...s, rank: idx + 1 }));

        setRankings(rankingsArr);
      }
    };

    fetchMarks();
  }, [selectedExam, selectedClass]);

  useEffect(() => {
    const fetchAttendance = async () => {
      let query = supabase
        .from("attendance")
        .select("*, students(name, roll_number, class_id)")
        .order("year", { ascending: false })
        .order("month");

      const { data, error } = await query;
      if (!error && data) {
        const filtered = selectedClass
          ? data.filter((a: any) => a.students?.class_id === selectedClass)
          : data;
        setAttendance(filtered);
      }
    };

    fetchAttendance();
  }, [selectedClass]);

  return (
    <DashboardLayout role="admin" title="Academics (View Only)">
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="w-48">
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-48">
                <Select value={selectedExam} onValueChange={setSelectedExam}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {examMonths.map((e) => (
                      <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="marks">
          <TabsList>
            <TabsTrigger value="marks">Marks</TabsTrigger>
            <TabsTrigger value="rankings">Rankings</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
          </TabsList>

          {/* Marks Tab */}
          <TabsContent value="marks">
            <Card>
              <CardHeader>
                <CardTitle>Student Marks</CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedExam ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Please select an exam to view marks
                  </div>
                ) : marks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No marks found for selected filters
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Roll No.</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Exam</TableHead>
                          <TableHead>Marks</TableHead>
                          <TableHead>Percentage</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {marks.map((m) => {
                          const pct = m.total_marks
                            ? Math.round(((m.marks_obtained || 0) / m.total_marks) * 100)
                            : 0;
                          return (
                            <TableRow key={m.id}>
                              <TableCell className="font-medium">{m.students?.name || "-"}</TableCell>
                              <TableCell>{m.students?.roll_number || "-"}</TableCell>
                              <TableCell>{m.subjects?.name || "-"}</TableCell>
                              <TableCell>{m.exam_months?.name || "-"}</TableCell>
                              <TableCell>{m.marks_obtained || 0}/{m.total_marks || 100}</TableCell>
                              <TableCell>
                                <Badge variant={pct >= 60 ? "default" : pct >= 40 ? "secondary" : "destructive"}>
                                  {pct}%
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rankings Tab */}
          <TabsContent value="rankings">
            <Card>
              <CardHeader>
                <CardTitle>Class Rankings</CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedExam ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Please select an exam to view rankings
                  </div>
                ) : rankings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No rankings available
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px]">Rank</TableHead>
                          <TableHead>Student</TableHead>
                          <TableHead>Roll No.</TableHead>
                          <TableHead>Total Marks</TableHead>
                          <TableHead>Percentage</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rankings.map((r) => (
                          <TableRow key={r.student_name + r.roll_number}>
                            <TableCell>
                              <Badge variant={r.rank <= 3 ? "default" : "outline"}>
                                #{r.rank}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{r.student_name}</TableCell>
                            <TableCell>{r.roll_number || "-"}</TableCell>
                            <TableCell>{r.total_marks}</TableCell>
                            <TableCell>{r.percentage}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Records</CardTitle>
              </CardHeader>
              <CardContent>
                {attendance.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No attendance records found
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Roll No.</TableHead>
                          <TableHead>Month</TableHead>
                          <TableHead>Year</TableHead>
                          <TableHead>Present</TableHead>
                          <TableHead>Percentage</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {attendance.map((a) => {
                          const pct = a.total_working_days
                            ? Math.round(((a.present_days || 0) / a.total_working_days) * 100)
                            : 0;
                          return (
                            <TableRow key={a.id}>
                              <TableCell className="font-medium">{a.students?.name || "-"}</TableCell>
                              <TableCell>{a.students?.roll_number || "-"}</TableCell>
                              <TableCell>{a.month}</TableCell>
                              <TableCell>{a.year}</TableCell>
                              <TableCell>{a.present_days || 0}/{a.total_working_days || 0}</TableCell>
                              <TableCell>
                                <Badge variant={pct >= 75 ? "default" : pct >= 50 ? "secondary" : "destructive"}>
                                  {pct}%
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminAcademics;
