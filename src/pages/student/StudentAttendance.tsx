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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface AttendanceRecord {
  id: string;
  month: string;
  year: number;
  present_days: number | null;
  total_working_days: number | null;
}

const StudentAttendance = () => {
  const { user, userRole } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!user) return;

      try {
        // Get student id
        let studentQuery = supabase.from("students").select("id");
        if (userRole === "parent") {
          studentQuery = studentQuery.eq("parent_id", user.id);
        } else {
          studentQuery = studentQuery.eq("user_id", user.id);
        }

        const { data: students } = await studentQuery;
        if (students?.[0]) {
          const { data } = await supabase
            .from("attendance")
            .select("*")
            .eq("student_id", students[0].id)
            .order("year", { ascending: false })
            .order("month");

          setAttendance(data || []);
        }
      } catch (error) {
        console.error("Error fetching attendance:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [user, userRole]);

  // Calculate overall attendance
  const totalPresent = attendance.reduce((sum, a) => sum + (a.present_days || 0), 0);
  const totalDays = attendance.reduce((sum, a) => sum + (a.total_working_days || 0), 0);
  const overallPercentage = totalDays > 0 ? Math.round((totalPresent / totalDays) * 100) : 0;

  return (
    <DashboardLayout role="student" title="Attendance Summary">
      <div className="space-y-6">
        {/* Overall Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Overall Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Attendance Percentage</span>
                <span className="text-2xl font-bold">{overallPercentage}%</span>
              </div>
              <Progress value={overallPercentage} className="h-3" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Total Present: {totalPresent} days</span>
                <span>Total Working Days: {totalDays} days</span>
              </div>
              {overallPercentage < 75 && (
                <p className="text-destructive text-sm">
                  ⚠️ Your attendance is below 75%. Please maintain regular attendance.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : attendance.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No attendance records found
              </div>
            ) : (
              <div className="rounded-md border">
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
                    {attendance.map((a) => {
                      const pct = a.total_working_days
                        ? Math.round(((a.present_days || 0) / a.total_working_days) * 100)
                        : 0;
                      return (
                        <TableRow key={a.id}>
                          <TableCell className="font-medium">{a.month}</TableCell>
                          <TableCell>{a.year}</TableCell>
                          <TableCell>{a.present_days || 0}</TableCell>
                          <TableCell>{a.total_working_days || 0}</TableCell>
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
      </div>
    </DashboardLayout>
  );
};

export default StudentAttendance;
