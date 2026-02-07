import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useTeacherData } from "@/hooks/useTeacherData";
import { ClassSubjectSelector } from "@/components/teacher/ClassSubjectSelector";

const TeacherStudents = () => {
  const {
    assignedClasses,
    assignedSubjects,
    selectedClassId,
    setSelectedClassId,
    students,
    loading,
    hasMultipleClasses,
  } = useTeacherData();

  const [searchQuery, setSearchQuery] = useState("");

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.roll_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout role="teacher" title="Student List">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teacher" title="Student List">
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
            <CardTitle>
              Students
              {selectedClassId && assignedClasses.length > 0 && (
                <span className="text-muted-foreground font-normal ml-2">
                  ({assignedClasses.find(c => c.id === selectedClassId)?.name || ""})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedClassId && hasMultipleClasses ? (
              <div className="text-center py-8 text-muted-foreground">
                Please select a class to view students
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search students..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {students.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No students found in this class
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px]">Roll No.</TableHead>
                          <TableHead>Student Name</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell>{student.roll_number || "-"}</TableCell>
                            <TableCell className="font-medium">{student.name}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TeacherStudents;
