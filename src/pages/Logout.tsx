import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, MapPin, Clock, TrendingUp, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Logout if user want to cancel or proceed with logout
const LogoutPrompt = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-card border-border text-center">
        <AlertTriangle className="h-10 w-10 text-primary animate-pulse-slow mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gradient mb-2">Confirm Logout</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Are you sure you want to log out of your account?
        </p>
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button onClick={() => navigate("/auth")}>
            Logout
          </Button>
        </div>
      </Card>
    </div>
  );

};

/*
// Logout confirmation component to sign out the user and redirect to the login page
const Logout = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const logoutUser = async () => {
      setLoading(true);
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        toast.success("Successfully logged out.");
        navigate("/auth");
      }
      catch (error: any) {
        toast.error("Error logging out: " + error.message);
      }
      finally {
        setLoading(false);
      }
    };
    logoutUser();
  }, [navigate]); 

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-card border-border text-center">
        <AlertTriangle className="h-10 w-10 text-primary animate-pulse-slow mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gradient mb-2">Logging Out</h1>
        <p className="text-sm text-muted-foreground">
          {loading ? "Please wait while we log you out..." : "You have been logged out."}
        </p>
      </Card>
    </div>
  );
};

*/

export default LogoutPrompt;