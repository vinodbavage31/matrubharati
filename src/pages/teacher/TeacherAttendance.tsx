import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { toast } from "sonner";
import { Save } from "lucide-react";
import { useTeacherData } from "@/hooks/useTeacherData";
import { ClassSubjectSelector } from "@/components/teacher/ClassSubjectSelector";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const TeacherAttendance = () => {
  const {
    teacherId,
    assignedClasses,
    assignedSubjects,
    selectedClassId,
    setSelectedClassId,
    students,
    loading,
    hasMultipleClasses,
  } = useTeacherData();

  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [totalWorkingDays, setTotalWorkingDays] = useState<number>(22);
  const [attendanceData, setAttendanceData] = useState<Record<string, number>>({});
  const [existingIds, setExistingIds] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - 2 + i).toString());

  // Reset attendance data when class changes
  useEffect(() => {
    setAttendanceData({});
    setExistingIds({});
  }, [selectedClassId]);

  // Fetch existing attendance when month/year changes
  useEffect(() => {
    const fetchExistingAttendance = async () => {
      if (!selectedMonth || !selectedYear || students.length === 0) return;

      const { data } = await supabase
        .from("attendance")
        .select("id, student_id, present_days, total_working_days")
        .eq("month", selectedMonth)
        .eq("year", parseInt(selectedYear));

      const attendanceMap: Record<string, number> = {};
      const idsMap: Record<string, string> = {};

      data?.forEach((a) => {
        if (a.student_id) {
          attendanceMap[a.student_id] = a.present_days || 0;
          idsMap[a.student_id] = a.id;
          if (a.total_working_days) {
            setTotalWorkingDays(a.total_working_days);
          }
        }
      });

      setAttendanceData(attendanceMap);
      setExistingIds(idsMap);
    };

    fetchExistingAttendance();
  }, [selectedMonth, selectedYear, students]);

  const handleAttendanceChange = (studentId: string, days: string) => {
    const numDays = Math.min(parseInt(days) || 0, totalWorkingDays);
    setAttendanceData((prev) => ({ ...prev, [studentId]: numDays }));
  };

  const handleSave = async () => {
    if (!selectedMonth || !selectedYear || !teacherId) {
      toast.error("Please select month and year");
      return;
    }

    setSaving(true);

    try {
      const operations = students.map(async (student) => {
        const presentDays = attendanceData[student.id] || 0;
        const existingId = existingIds[student.id];

        if (existingId) {
          return supabase
            .from("attendance")
            .update({
              present_days: presentDays,
              total_working_days: totalWorkingDays,
            })
            .eq("id", existingId);
        } else {
          return supabase.from("attendance").insert({
            student_id: student.id,
            teacher_id: teacherId,
            month: selectedMonth,
            year: parseInt(selectedYear),
            present_days: presentDays,
            total_working_days: totalWorkingDays,
          });
        }
      });

      await Promise.all(operations);
      toast.success("Attendance saved successfully");
    } catch (error: any) {
      console.error("Error saving attendance:", error);
      toast.error(error.message || "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="teacher" title="Attendance">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teacher" title="Attendance Management">
      <div className="space-y-6">
        {/* Class Selector */}
        <ClassSubjectSelector
          classes={assignedClasses}
          subjects={assignedSubjects}
          selectedClassId={selectedClassId}
          onClassChange={setSelectedClassId}
          showSubjectSelector={false}
          hasMultipleClasses={hasMultipleClasses}
        />

        <Card>
          <CardHeader>
            <CardTitle>Mark Attendance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <div className="w-40">
                <Label>Month</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-32">
                <Label>Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={y}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-40">
                <Label>Total Working Days</Label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={totalWorkingDays}
                  onChange={(e) => setTotalWorkingDays(parseInt(e.target.value) || 22)}
                />
              </div>
            </div>

            {!selectedClassId && hasMultipleClasses ? (
              <div className="text-center py-8 text-muted-foreground">
                Please select a class first
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No students found in this class
              </div>
            ) : !selectedMonth || !selectedYear ? (
              <div className="text-center py-8 text-muted-foreground">
                Please select a month and year to mark attendance
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Roll No.</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead className="w-[150px]">Present Days</TableHead>
                        <TableHead className="w-[100px]">Total Days</TableHead>
                        <TableHead className="w-[100px]">Percentage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => {
                        const present = attendanceData[student.id] || 0;
                        const pct = totalWorkingDays > 0
                          ? Math.round((present / totalWorkingDays) * 100)
                          : 0;
                        return (
                          <TableRow key={student.id}>
                            <TableCell>{student.roll_number || "-"}</TableCell>
                            <TableCell className="font-medium">{student.name}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                max={totalWorkingDays}
                                value={attendanceData[student.id] ?? ""}
                                onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                                className="w-24"
                              />
                            </TableCell>
                            <TableCell>{totalWorkingDays}</TableCell>
                            <TableCell className={pct < 75 ? "text-destructive" : ""}>
                              {pct}%
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-secondary hover:bg-secondary/90"
                >
                  {saving ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Attendance
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TeacherAttendance;
