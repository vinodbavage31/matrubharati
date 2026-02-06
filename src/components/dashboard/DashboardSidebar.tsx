import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  School,
  Settings,
  LogOut,
  ClipboardList,
  Calendar,
  UserCircle,
  BarChart3,
  TrendingUp,
  Award,
} from "lucide-react";
import logo from "@/assets/logo.png";

interface MenuItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface DashboardSidebarProps {
  role: "admin" | "teacher" | "student";
}

const adminMenuItems: MenuItem[] = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Students", url: "/admin/students", icon: Users },
  { title: "Teachers", url: "/admin/teachers", icon: GraduationCap },
  { title: "Classes & Subjects", url: "/admin/classes", icon: BookOpen },
  { title: "Academics", url: "/admin/academics", icon: School },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

const teacherMenuItems: MenuItem[] = [
  { title: "Dashboard", url: "/teacher", icon: LayoutDashboard },
  { title: "Marks Entry", url: "/teacher/marks", icon: ClipboardList },
  { title: "Attendance", url: "/teacher/attendance", icon: Calendar },
  { title: "Student List", url: "/teacher/students", icon: Users },
  { title: "Profile", url: "/teacher/profile", icon: UserCircle },
];

const studentMenuItems: MenuItem[] = [
  { title: "Performance", url: "/student", icon: LayoutDashboard },
  { title: "Subject Marks", url: "/student/marks", icon: ClipboardList },
  { title: "Rankings", url: "/student/rankings", icon: Award },
  { title: "Attendance", url: "/student/attendance", icon: Calendar },
  { title: "Progress", url: "/student/progress", icon: TrendingUp },
];

const DashboardSidebar = ({ role }: DashboardSidebarProps) => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const menuItems =
    role === "admin"
      ? adminMenuItems
      : role === "teacher"
      ? teacherMenuItems
      : studentMenuItems;

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const roleLabel =
    role === "admin" ? "Administrator" : role === "teacher" ? "Teacher" : "Student Portal";

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="h-10 w-10 object-contain" />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-sm">Matru Bharati</span>
              <span className="text-xs text-muted-foreground">{roleLabel}</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === `/${role}`}
                      className="hover:bg-muted/50"
                      activeClassName="bg-muted text-secondary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        {!collapsed && (
          <div className="mb-3 text-xs text-muted-foreground truncate">
            {user?.email}
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          className="w-full justify-start gap-2"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && "Sign Out"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
