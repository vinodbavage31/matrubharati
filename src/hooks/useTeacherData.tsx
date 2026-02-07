import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface TeacherClass {
  id: string;
  name: string;
}

interface TeacherSubject {
  id: string;
  name: string;
  class_id: string | null;
  total_marks: number | null;
}

interface Student {
  id: string;
  name: string;
  roll_number: string | null;
}

interface ExamMonth {
  id: string;
  name: string;
  month_year: string;
  class_id: string | null;
}

export const useTeacherData = () => {
  const { user } = useAuth();
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [assignedClasses, setAssignedClasses] = useState<TeacherClass[]>([]);
  const [assignedSubjects, setAssignedSubjects] = useState<TeacherSubject[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [examMonths, setExamMonths] = useState<ExamMonth[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch teacher's assigned classes and subjects
  useEffect(() => {
    const fetchTeacherAssignments = async () => {
      if (!user) return;

      try {
        // Get teacher record
        const { data: teacher, error: teacherError } = await supabase
          .from("teachers")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (teacherError || !teacher) {
          console.error("Teacher not found:", teacherError);
          setLoading(false);
          return;
        }

        setTeacherId(teacher.id);

        // Fetch assigned classes
        const { data: classAssignments } = await supabase
          .from("teacher_classes")
          .select("class_id, classes(id, name)")
          .eq("teacher_id", teacher.id);

        const classes = (classAssignments || [])
          .map((ca: any) => ca.classes)
          .filter(Boolean);
        setAssignedClasses(classes);

        // Auto-select first class if only one
        if (classes.length === 1) {
          setSelectedClassId(classes[0].id);
        }

        // Fetch assigned subjects
        const { data: subjectAssignments } = await supabase
          .from("teacher_subjects")
          .select("subject_id, subjects(id, name, class_id, total_marks)")
          .eq("teacher_id", teacher.id);

        const subjects = (subjectAssignments || [])
          .map((sa: any) => sa.subjects)
          .filter(Boolean);
        setAssignedSubjects(subjects);

        // Fetch exam months
        const { data: exams } = await supabase
          .from("exam_months")
          .select("*")
          .order("created_at", { ascending: false });
        setExamMonths(exams || []);

      } catch (error) {
        console.error("Error fetching teacher data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherAssignments();
  }, [user]);

  // Fetch students when class is selected
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClassId) {
        setStudents([]);
        return;
      }

      const { data } = await supabase
        .from("students")
        .select("id, name, roll_number")
        .eq("class_id", selectedClassId)
        .order("roll_number");

      setStudents(data || []);
    };

    fetchStudents();
  }, [selectedClassId]);

  // Filter subjects based on selected class
  const filteredSubjects = assignedSubjects.filter(
    (s) => !s.class_id || s.class_id === selectedClassId
  );

  // Filter exam months based on selected class
  const filteredExamMonths = examMonths.filter(
    (e) => !e.class_id || e.class_id === selectedClassId
  );

  return {
    teacherId,
    assignedClasses,
    assignedSubjects: filteredSubjects,
    allSubjects: assignedSubjects,
    selectedClassId,
    setSelectedClassId,
    selectedSubjectId,
    setSelectedSubjectId,
    students,
    examMonths: filteredExamMonths,
    allExamMonths: examMonths,
    loading,
    hasMultipleClasses: assignedClasses.length > 1,
  };
};
