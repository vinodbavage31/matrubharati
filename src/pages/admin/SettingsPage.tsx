import { useEffect, useState } from 'react';
import { DashboardLayout, navIcons } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Users, GraduationCap, BookOpen, Save } from 'lucide-react';

const { LayoutDashboard, Settings, ClipboardList } = navIcons;

const adminNavItems = [
  { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Students', href: '/admin/students', icon: <Users className="h-4 w-4" /> },
  { label: 'Teachers', href: '/admin/teachers', icon: <GraduationCap className="h-4 w-4" /> },
  { label: 'Classes & Subjects', href: '/admin/classes', icon: <BookOpen className="h-4 w-4" /> },
  { label: 'Academics', href: '/admin/academics', icon: <ClipboardList className="h-4 w-4" /> },
  { label: 'Settings', href: '/admin/settings', icon: <Settings className="h-4 w-4" /> },
];

interface SchoolSettings {
  id: string;
  school_name: string | null;
  logo_url: string | null;
  academic_year: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
}

const SettingsPage = () => {
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase.from('school_settings').select('*').single();
    if (data) {
      setSettings(data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!settings) return;
    
    setSaving(true);
    const { error } = await supabase
      .from('school_settings')
      .update({
        school_name: settings.school_name,
        logo_url: settings.logo_url,
        academic_year: settings.academic_year,
        address: settings.address,
        phone: settings.phone,
        email: settings.email,
      })
      .eq('id', settings.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Settings saved successfully' });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <DashboardLayout navItems={adminNavItems} title="Admin Panel">
        <p className="text-center py-8 text-muted-foreground">Loading...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={adminNavItems} title="Admin Panel">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage school information</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>School Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>School Name</Label>
                <Input
                  value={settings?.school_name || ''}
                  onChange={(e) => setSettings(settings ? { ...settings, school_name: e.target.value } : null)}
                />
              </div>
              <div className="space-y-2">
                <Label>Academic Year</Label>
                <Input
                  value={settings?.academic_year || ''}
                  onChange={(e) => setSettings(settings ? { ...settings, academic_year: e.target.value } : null)}
                  placeholder="e.g., 2024-25"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={settings?.phone || ''}
                  onChange={(e) => setSettings(settings ? { ...settings, phone: e.target.value } : null)}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={settings?.email || ''}
                  onChange={(e) => setSettings(settings ? { ...settings, email: e.target.value } : null)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Logo URL</Label>
                <Input
                  value={settings?.logo_url || ''}
                  onChange={(e) => setSettings(settings ? { ...settings, logo_url: e.target.value } : null)}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Address</Label>
                <Textarea
                  value={settings?.address || ''}
                  onChange={(e) => setSettings(settings ? { ...settings, address: e.target.value } : null)}
                  rows={3}
                />
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
