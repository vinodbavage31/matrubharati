-- =============================================
-- PHASE 1: ADD NEW COLUMNS TO STUDENTS TABLE
-- =============================================

-- Add email and mobile columns to students
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS mobile text;

-- =============================================
-- PHASE 2: CREATE TEACHER_CLASSES JOIN TABLE
-- =============================================

-- Create teacher_classes join table for many-to-many relationship
CREATE TABLE IF NOT EXISTS public.teacher_classes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id uuid NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(teacher_id, class_id)
);

-- Enable RLS on the new table
ALTER TABLE public.teacher_classes ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PHASE 3: MIGRATE EXISTING DATA
-- =============================================

-- Migrate existing teacher-class assignments to the join table
INSERT INTO public.teacher_classes (teacher_id, class_id)
SELECT id, assigned_class_id
FROM public.teachers
WHERE assigned_class_id IS NOT NULL
ON CONFLICT (teacher_id, class_id) DO NOTHING;

-- =============================================
-- PHASE 4: CREATE SECURITY DEFINER FUNCTIONS
-- =============================================

-- Function to check if a teacher is assigned to a class
CREATE OR REPLACE FUNCTION public.teacher_has_class(teacher_user_id uuid, check_class_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.teacher_classes tc
    JOIN public.teachers t ON t.id = tc.teacher_id
    WHERE t.user_id = teacher_user_id
      AND tc.class_id = check_class_id
  )
$$;

-- Function to get all class IDs for a teacher
CREATE OR REPLACE FUNCTION public.get_teacher_class_ids(teacher_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tc.class_id
  FROM public.teacher_classes tc
  JOIN public.teachers t ON t.id = tc.teacher_id
  WHERE t.user_id = teacher_user_id
$$;

-- Function to check if teacher has a subject assigned
CREATE OR REPLACE FUNCTION public.teacher_has_subject(teacher_user_id uuid, check_subject_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.teacher_subjects ts
    JOIN public.teachers t ON t.id = ts.teacher_id
    WHERE t.user_id = teacher_user_id
      AND ts.subject_id = check_subject_id
  )
$$;

-- =============================================
-- PHASE 5: UPDATE RLS POLICIES
-- =============================================

-- Drop and recreate students RLS policies to use new multi-class function
DROP POLICY IF EXISTS "Teachers can view students in their class" ON public.students;

CREATE POLICY "Teachers can view students in their assigned classes"
ON public.students
FOR SELECT
USING (
  is_admin(auth.uid())
  OR user_id = auth.uid()
  OR parent_id = auth.uid()
  OR class_id IN (SELECT public.get_teacher_class_ids(auth.uid()))
);

-- RLS for teacher_classes table
CREATE POLICY "Admins can manage teacher_classes"
ON public.teacher_classes
FOR ALL
USING (is_admin(auth.uid()));

CREATE POLICY "Teachers can view their own class assignments"
ON public.teacher_classes
FOR SELECT
USING (
  teacher_id = get_teacher_id(auth.uid())
  OR is_admin(auth.uid())
);

CREATE POLICY "Authenticated can view teacher_classes"
ON public.teacher_classes
FOR SELECT
USING (true);

-- Update marks RLS to use new functions
DROP POLICY IF EXISTS "Teachers can manage marks for their students" ON public.marks;

CREATE POLICY "Teachers can manage marks for their assigned students and subjects"
ON public.marks
FOR ALL
USING (
  EXISTS (
    SELECT 1 
    FROM public.students s
    WHERE s.id = marks.student_id 
      AND s.class_id IN (SELECT public.get_teacher_class_ids(auth.uid()))
      AND public.teacher_has_subject(auth.uid(), marks.subject_id)
  )
);

-- Update attendance RLS to use new functions
DROP POLICY IF EXISTS "Teachers can manage attendance for their students" ON public.attendance;

CREATE POLICY "Teachers can manage attendance for their assigned students"
ON public.attendance
FOR ALL
USING (
  EXISTS (
    SELECT 1 
    FROM public.students s
    WHERE s.id = attendance.student_id 
      AND s.class_id IN (SELECT public.get_teacher_class_ids(auth.uid()))
  )
);

-- =============================================
-- PHASE 6: CREATE INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_teacher_classes_teacher_id ON public.teacher_classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_classes_class_id ON public.teacher_classes(class_id);
CREATE INDEX IF NOT EXISTS idx_students_email ON public.students(email);
CREATE INDEX IF NOT EXISTS idx_teacher_subjects_teacher_id ON public.teacher_subjects(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_subjects_subject_id ON public.teacher_subjects(subject_id);