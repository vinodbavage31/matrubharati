import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Star, User } from "lucide-react";

interface Ranking {
  rank: number;
  studentId: string;
  student_name: string;
  section: string | null;
  roll_number: string | null;
  total_marks: number;
  max_marks: number;
  percentage: number;
  isCurrentStudent: boolean;
}

interface ExamMonth {
  id: string;
  name: string;
}

const StudentRankings = () => {
  const { user, userRole } = useAuth();
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [examMonths, setExamMonths] = useState<ExamMonth[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>("");
  const [studentId, setStudentId] = useState<string | null>(null);
  const [classId, setClassId] = useState<string | null>(null);
  const [className, setClassName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [currentStudentRank, setCurrentStudentRank] = useState<Ranking | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!user) return;

      try {
        // Get student info
        let studentQuery = supabase.from("students").select("id, class_id, classes(name)");
        if (userRole === "parent") {
          studentQuery = studentQuery.eq("parent_id", user.id);
        } else {
          studentQuery = studentQuery.eq("user_id", user.id);
        }

        const { data: students } = await studentQuery;
        if (students?.[0]) {
          setStudentId(students[0].id);
          setClassId(students[0].class_id);
          setClassName(students[0].classes?.name || "");
        }

        // Get exam months
        const { data: exams } = await supabase
          .from("exam_months")
          .select("id, name")
          .order("created_at", { ascending: false });
        setExamMonths(exams || []);

        if (exams?.[0]) {
          setSelectedExam(exams[0].id);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [user, userRole]);

  useEffect(() => {
    const fetchRankings = async () => {
      if (!classId || !selectedExam) return;

      setLoading(true);

      // Get all students in the class with their details
      const { data: students } = await supabase
        .from("students")
        .select("id, name, section, roll_number")
        .eq("class_id", classId)
        .order("roll_number", { ascending: true });

      if (!students) {
        setLoading(false);
        return;
      }

      // Get all marks for the exam
      const { data: marks } = await supabase
        .from("marks")
        .select("student_id, marks_obtained, total_marks")
        .eq("exam_month_id", selectedExam);

      // Get subjects to determine max possible marks
      const { data: subjects } = await supabase
        .from("subjects")
        .select("id, total_marks")
        .eq("class_id", classId);

      const totalPossibleMarks = subjects?.reduce((sum, s) => sum + (s.total_marks || 100), 0) || 0;

      // Calculate totals for each student
      const studentTotals: Record<string, { 
        name: string; 
        section: string | null;
        roll_number: string | null;
        total: number; 
        max: number 
      }> = {};

      students.forEach((s) => {
        studentTotals[s.id] = { 
          name: s.name, 
          section: s.section,
          roll_number: s.roll_number,
          total: 0, 
          max: totalPossibleMarks 
        };
      });

      marks?.forEach((m) => {
        if (studentTotals[m.student_id]) {
          studentTotals[m.student_id].total += m.marks_obtained || 0;
        }
      });

      // Sort by percentage and create rankings
      const rankingsArr = Object.entries(studentTotals)
        .map(([id, data]) => ({
          studentId: id,
          student_name: data.name,
          section: data.section,
          roll_number: data.roll_number,
          total_marks: data.total,
          max_marks: data.max,
          percentage: data.max > 0 ? Math.round((data.total / data.max) * 100 * 10) / 10 : 0,
          rank: 0,
          isCurrentStudent: id === studentId,
        }))
        .sort((a, b) => b.percentage - a.percentage)
        .map((s, idx) => ({ ...s, rank: idx + 1 }));

      setRankings(rankingsArr);
      
      // Find current student's rank for the summary card
      const current = rankingsArr.find(r => r.isCurrentStudent);
      setCurrentStudentRank(current || null);
      
      setLoading(false);
    };

    fetchRankings();
  }, [classId, selectedExam, studentId]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRankBadgeVariant = (rank: number): "default" | "secondary" | "outline" => {
    if (rank === 1) return "default";
    if (rank <= 3) return "secondary";
    return "outline";
  };

  return (
    <DashboardLayout role="student" title="Class Rankings">
      <div className="space-y-6">
        {/* Current Student Summary Card */}
        {currentStudentRank && (
          <Card className="border-secondary/50 bg-secondary/5">
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center">
                    {getRankIcon(currentStudentRank.rank) || <Star className="h-6 w-6 text-secondary" />}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Your Rank</p>
                    <p className="text-3xl font-bold text-secondary">#{currentStudentRank.rank}</p>
                  </div>
                </div>
                <div className="h-12 w-px bg-border hidden sm:block" />
                <div>
                  <p className="text-sm text-muted-foreground">Percentage</p>
                  <p className="text-2xl font-bold">{currentStudentRank.percentage}%</p>
                </div>
                <div className="h-12 w-px bg-border hidden sm:block" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Marks</p>
                  <p className="text-2xl font-bold">{currentStudentRank.total_marks}/{currentStudentRank.max_marks}</p>
                </div>
                <div className="h-12 w-px bg-border hidden sm:block" />
                <div>
                  <p className="text-sm text-muted-foreground">Out of</p>
                  <p className="text-2xl font-bold">{rankings.length} students</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Full Class Ranking Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle>Class Ranking - {className}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Full class performance rankings
              </p>
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
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading rankings...</div>
            ) : rankings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No rankings available for selected exam
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[80px]">Rank</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Roll No</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead className="text-right">Total Marks</TableHead>
                      <TableHead className="text-right">Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rankings.map((r) => (
                      <TableRow
                        key={r.studentId}
                        className={r.isCurrentStudent 
                          ? "bg-secondary/10 border-l-4 border-l-secondary" 
                          : ""
                        }
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getRankIcon(r.rank)}
                            <Badge variant={getRankBadgeVariant(r.rank)}>
                              #{r.rank}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{r.student_name}</span>
                            {r.isCurrentStudent && (
                              <Badge variant="default" className="bg-secondary text-secondary-foreground">
                                <User className="h-3 w-3 mr-1" />
                                {userRole === "parent" ? "Your Child" : "You"}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {r.roll_number || "-"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {r.section || "-"}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {r.total_marks}/{r.max_marks}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`font-bold ${
                            r.percentage >= 80 ? "text-green-600" :
                            r.percentage >= 60 ? "text-blue-600" :
                            r.percentage >= 40 ? "text-yellow-600" :
                            "text-red-600"
                          }`}>
                            {r.percentage}%
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <p className="mt-4 text-sm text-muted-foreground">
              Note: Rankings are calculated based on total percentage across all subjects. 
              Subject-wise marks of other students are kept private.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentRankings;
