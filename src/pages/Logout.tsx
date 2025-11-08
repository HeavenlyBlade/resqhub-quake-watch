import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, MapPin, Clock, TrendingUp, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Logout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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
      <Card className="w-full max-w-md p-8 bg-card border-border flex flex-col items-center">
        <AlertTriangle className="h-10 w-10 text-primary animate-pulse-slow mb-4" />
        <h1 className="text-2xl font-bold text-gradient mb-2">Logging Out</h1>
        <p className="text-sm text-muted-foreground mb-6">You are being logged out of your account.</p>
        <Button disabled={loading} onClick={() => navigate("/auth")}>
          {loading ? "Logging Out..." : "Go to Login"}
        </Button>
      </Card>
    </div>
  );
};

export default Logout;