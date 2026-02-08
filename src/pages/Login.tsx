import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getDashboardPath } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Shield, GraduationCap, Users, ArrowLeft, Eye, EyeOff } from "lucide-react";
import logo from "@/assets/logo.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, userRole, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user && userRole) {
      navigate(getDashboardPath(userRole));
    }
  }, [user, userRole, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message);
        setIsLoading(false);
      } else {
        toast.success("Login successful! Redirecting...");
        // The useEffect above will handle redirect once userRole is set
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  const loginHints = {
    admin: "Admin credentials are provided by the school administrator",
    teacher: "Use your registered teacher email and password",
    student: "Use your student ID or parent-provided credentials",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex flex-col">
      {/* Header */}
      <header className="p-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Logo & Title */}
          <div className="text-center space-y-2">
            <img
              src={logo}
              alt="Matru Bharati School"
              className="h-20 w-auto mx-auto"
            />
            <h1 className="text-2xl font-bold text-foreground">
              Welcome Back
            </h1>
            <p className="text-muted-foreground">
              Sign in to access your dashboard
            </p>
          </div>

          {/* Login Card */}
          <Card className="shadow-lg border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Sign In</CardTitle>
              <CardDescription>
                Choose your role and enter your credentials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="admin" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="admin" className="text-xs sm:text-sm">
                    <Shield className="h-4 w-4 mr-1 sm:mr-2" />
                    Admin
                  </TabsTrigger>
                  <TabsTrigger value="teacher" className="text-xs sm:text-sm">
                    <GraduationCap className="h-4 w-4 mr-1 sm:mr-2" />
                    Teacher
                  </TabsTrigger>
                  <TabsTrigger value="student" className="text-xs sm:text-sm">
                    <Users className="h-4 w-4 mr-1 sm:mr-2" />
                    Student
                  </TabsTrigger>
                </TabsList>

                {["admin", "teacher", "student"].map((role) => (
                  <TabsContent key={role} value={role}>
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                        {loginHints[role as keyof typeof loginHints]}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          autoComplete="email"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-secondary hover:bg-secondary/90"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          "Sign In"
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* Forgot Password Link */}
          <div className="text-center space-y-2">
            <Link to="/forgot-password" className="text-sm text-secondary hover:underline">
              Forgot your password?
            </Link>
            <p className="text-sm text-muted-foreground">
              Having trouble signing in?{" "}
              <a href="mailto:support@matrubharati.edu" className="text-secondary hover:underline">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
