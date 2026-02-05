import { useEffect, useState } from 'react';
import { DashboardLayout, navIcons } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Users, GraduationCap, BookOpen, Trash2 } from 'lucide-react';

const { LayoutDashboard, Settings, ClipboardList } = navIcons;

const adminNavItems = [
  { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Students', href: '/admin/students', icon: <Users className="h-4 w-4" /> },
  { label: 'Teachers', href: '/admin/teachers', icon: <GraduationCap className="h-4 w-4" /> },
  { label: 'Classes & Subjects', href: '/admin/classes', icon: <BookOpen className="h-4 w-4" /> },
  { label: 'Academics', href: '/admin/academics', icon: <ClipboardList className="h-4 w-4" /> },
  { label: 'Settings', href: '/admin/settings', icon: <Settings className="h-4 w-4" /> },
];

interface Class {
  id: string;
  name: string;
  section: string | null;
  academic_year: string | null;
}

interface Subject {
  id: string;
  name: string;
  class_id: string | null;
  total_marks: number | null;
  classes?: { name: string } | null;
}

interface ExamMonth {
  id: string;
  name: string;
  month_year: string;
  class_id: string | null;
  is_active: boolean | null;
  classes?: { name: string } | null;
}

const ClassesPage = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [examMonths, setExamMonths] = useState<ExamMonth[]>([]);
  const [loading, setLoading] = useState(true);
  const [classDialogOpen, setClassDialogOpen] = useState(false);
  const [subjectDialogOpen, setSubjectDialogOpen] = useState(false);
  const [examDialogOpen, setExamDialogOpen] = useState(false);
  
  const [classForm, setClassForm] = useState({ name: '', section: '', academic_year: '' });
  const [subjectForm, setSubjectForm] = useState({ name: '', class_id: '', total_marks: '100' });
  const [examForm, setExamForm] = useState({ name: '', month_year: '', class_id: '' });
  
  const { toast } = useToast();

  const fetchData = async () => {
    const [classesRes, subjectsRes, examMonthsRes] = await Promise.all([
      supabase.from('classes').select('*').order('name'),
      supabase.from('subjects').select('*, classes(name)').order('name'),
      supabase.from('exam_months').select('*, classes(name)').order('created_at', { ascending: false }),
    ]);

    if (classesRes.data) setClasses(classesRes.data);
    if (subjectsRes.data) setSubjects(subjectsRes.data);
    if (examMonthsRes.data) setExamMonths(examMonthsRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('classes').insert([{
      name: classForm.name,
      section: classForm.section || null,
      academic_year: classForm.academic_year || null,
    }]);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Class added successfully' });
      setClassDialogOpen(false);
      setClassForm({ name: '', section: '', academic_year: '' });
      fetchData();
    }
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('subjects').insert([{
      name: subjectForm.name,
      class_id: subjectForm.class_id || null,
      total_marks: parseInt(subjectForm.total_marks) || 100,
    }]);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Subject added successfully' });
      setSubjectDialogOpen(false);
      setSubjectForm({ name: '', class_id: '', total_marks: '100' });
      fetchData();
    }
  };

  const handleAddExamMonth = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('exam_months').insert([{
      name: examForm.name,
      month_year: examForm.month_year,
      class_id: examForm.class_id || null,
    }]);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Exam month added successfully' });
      setExamDialogOpen(false);
      setExamForm({ name: '', month_year: '', class_id: '' });
      fetchData();
    }
  };

  return (
    <DashboardLayout navItems={adminNavItems} title="Admin Panel">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Classes & Subjects</h1>
          <p className="text-muted-foreground">Manage classes, subjects, and exam months</p>
        </div>

        <Tabs defaultValue="classes">
          <TabsList>
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
            <TabsTrigger value="exams">Exam Months</TabsTrigger>
          </TabsList>

          <TabsContent value="classes" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={classDialogOpen} onOpenChange={setClassDialogOpen}>
                <DialogTrigger asChild>
                  <Button><Plus className="h-4 w-4 mr-2" />Add Class</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add New Class</DialogTitle></DialogHeader>
                  <form onSubmit={handleAddClass} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Class Name</Label>
                      <Input value={classForm.name} onChange={(e) => setClassForm({ ...classForm, name: e.target.value })} required placeholder="e.g., Class 10" />
                    </div>
                    <div className="space-y-2">
                      <Label>Section</Label>
                      <Input value={classForm.section} onChange={(e) => setClassForm({ ...classForm, section: e.target.value })} placeholder="e.g., A" />
                    </div>
                    <div className="space-y-2">
                      <Label>Academic Year</Label>
                      <Input value={classForm.academic_year} onChange={(e) => setClassForm({ ...classForm, academic_year: e.target.value })} placeholder="e.g., 2024-25" />
                    </div>
                    <Button type="submit" className="w-full">Add Class</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <Card>
              <CardContent className="pt-6">
                {loading ? <p className="text-center py-8 text-muted-foreground">Loading...</p> : classes.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No classes found</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Section</TableHead>
                        <TableHead>Academic Year</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classes.map((cls) => (
                        <TableRow key={cls.id}>
                          <TableCell className="font-medium">{cls.name}</TableCell>
                          <TableCell>{cls.section || '-'}</TableCell>
                          <TableCell>{cls.academic_year || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subjects" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={subjectDialogOpen} onOpenChange={setSubjectDialogOpen}>
                <DialogTrigger asChild>
                  <Button><Plus className="h-4 w-4 mr-2" />Add Subject</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add New Subject</DialogTitle></DialogHeader>
                  <form onSubmit={handleAddSubject} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Subject Name</Label>
                      <Input value={subjectForm.name} onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Class</Label>
                      <Select value={subjectForm.class_id} onValueChange={(value) => setSubjectForm({ ...subjectForm, class_id: value })}>
                        <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                        <SelectContent>
                          {classes.map((cls) => (<SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Total Marks</Label>
                      <Input type="number" value={subjectForm.total_marks} onChange={(e) => setSubjectForm({ ...subjectForm, total_marks: e.target.value })} />
                    </div>
                    <Button type="submit" className="w-full">Add Subject</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <Card>
              <CardContent className="pt-6">
                {loading ? <p className="text-center py-8 text-muted-foreground">Loading...</p> : subjects.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No subjects found</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Total Marks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subjects.map((subject) => (
                        <TableRow key={subject.id}>
                          <TableCell className="font-medium">{subject.name}</TableCell>
                          <TableCell>{subject.classes?.name || '-'}</TableCell>
                          <TableCell>{subject.total_marks}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exams" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={examDialogOpen} onOpenChange={setExamDialogOpen}>
                <DialogTrigger asChild>
                  <Button><Plus className="h-4 w-4 mr-2" />Add Exam Month</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add Exam Month</DialogTitle></DialogHeader>
                  <form onSubmit={handleAddExamMonth} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Exam Name</Label>
                      <Input value={examForm.name} onChange={(e) => setExamForm({ ...examForm, name: e.target.value })} required placeholder="e.g., Mid-Term" />
                    </div>
                    <div className="space-y-2">
                      <Label>Month/Year</Label>
                      <Input value={examForm.month_year} onChange={(e) => setExamForm({ ...examForm, month_year: e.target.value })} required placeholder="e.g., October 2024" />
                    </div>
                    <div className="space-y-2">
                      <Label>Class</Label>
                      <Select value={examForm.class_id} onValueChange={(value) => setExamForm({ ...examForm, class_id: value })}>
                        <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                        <SelectContent>
                          {classes.map((cls) => (<SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full">Add Exam Month</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <Card>
              <CardContent className="pt-6">
                {loading ? <p className="text-center py-8 text-muted-foreground">Loading...</p> : examMonths.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No exam months found</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Exam Name</TableHead>
                        <TableHead>Month/Year</TableHead>
                        <TableHead>Class</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {examMonths.map((exam) => (
                        <TableRow key={exam.id}>
                          <TableCell className="font-medium">{exam.name}</TableCell>
                          <TableCell>{exam.month_year}</TableCell>
                          <TableCell>{exam.classes?.name || 'All Classes'}</TableCell>
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

export default ClassesPage;
