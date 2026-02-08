import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CreateUserRequest {
  email: string;
  fullName: string;
  role: "teacher" | "student";
  entityId: string; // teacher_id or student_id
  mobile?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header to verify admin access
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    // Create Supabase client with user's token
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseKey || !anonKey) {
      console.error("Missing environment variables:", {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseKey,
        hasAnonKey: !!anonKey,
      });
      throw new Error("Server configuration error: Missing Supabase credentials");
    }

    // Verify the requesting user is an admin
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: requestingUser } } = await userClient.auth.getUser();
    if (!requestingUser) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin
    const { data: profile } = await userClient
      .from("profiles")
      .select("role")
      .eq("id", requestingUser.id)
      .single();

    if (profile?.role !== "admin") {
      throw new Error("Only admins can create user accounts");
    }

    // Parse request body
    const { email, fullName, role, entityId, mobile }: CreateUserRequest = await req.json();

    if (!email || !fullName || !role || !entityId) {
      throw new Error("Missing required fields: email, fullName, role, entityId");
    }

    // Create admin client for user creation
    const adminClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get the origin for redirect URL
    const origin = req.headers.get("origin") || req.headers.get("referer")?.replace(/\/$/, "") || "";

    // Generate invite link (user will set their own password)
    const { data: authData, error: authError } = await adminClient.auth.admin.inviteUserByEmail(
      email,
      {
        data: {
          full_name: fullName,
          role: role,
        },
        redirectTo: `${origin}/set-password`,
      }
    );

    if (authError) {
      console.error("Auth error:", authError);
      throw new Error(`Failed to create auth user: ${authError.message}`);
    }

    const newUserId = authData.user.id;

    // Update the profile with the correct role
    const { error: profileError } = await adminClient
      .from("profiles")
      .update({ role: role, full_name: fullName, email: email })
      .eq("id", newUserId);

    if (profileError) {
      console.error("Profile update error:", profileError);
    }

    // Link the auth user to the teacher or student record
    if (role === "teacher") {
      const { error: teacherError } = await adminClient
        .from("teachers")
        .update({ user_id: newUserId })
        .eq("id", entityId);

      if (teacherError) {
        console.error("Teacher update error:", teacherError);
        throw new Error(`Failed to link auth user to teacher: ${teacherError.message}`);
      }
    } else if (role === "student") {
      const { error: studentError } = await adminClient
        .from("students")
        .update({ user_id: newUserId })
        .eq("id", entityId);

      if (studentError) {
        console.error("Student update error:", studentError);
        throw new Error(`Failed to link auth user to student: ${studentError.message}`);
      }
    }

    console.log(`Successfully created auth user for ${role}: ${email}`);

    return new Response(
      JSON.stringify({
        success: true,
        userId: newUserId,
        message: `Account created. An email has been sent to ${email} with instructions to set their password.`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in create-user-auth function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "An error occurred",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
