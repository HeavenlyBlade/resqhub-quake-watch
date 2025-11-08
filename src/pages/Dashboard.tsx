import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, MapPin, Clock, TrendingUp, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface EarthquakeAlert {
  id: string;
  earthquake_id: string;
  magnitude: number;
  location: string;
  latitude: number;
  longitude: number;
  depth_km: number;
  time: string;
  significance: number;
  alert_level: string;
  tsunami_warning: boolean;
}

const Dashboard = () => {
  const [alerts, setAlerts] = useState<EarthquakeAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAlerts();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('earthquake_alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'earthquake_alerts'
        },
        (payload) => {
          setAlerts(prev => [payload.new as EarthquakeAlert, ...prev]);
          toast.error(`New earthquake detected: M${(payload.new as EarthquakeAlert).magnitude}`, {
            description: (payload.new as EarthquakeAlert).location
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('earthquake_alerts')
        .select('*')
        .order('time', { ascending: false })
        .limit(20);

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast.error("Failed to load earthquake data");
    } finally {
      setLoading(false);
    }
  };

  const getMagnitudeColor = (magnitude: number) => {
    if (magnitude >= 7) return "alert-critical";
    if (magnitude >= 6) return "alert-warning";
    if (magnitude >= 5) return "alert-moderate";
    return "alert-info";
  };

  const getAlertBadge = (magnitude: number) => {
    if (magnitude >= 7) return { text: "CRITICAL", variant: "destructive" as const };
    if (magnitude >= 6) return { text: "SEVERE", variant: "destructive" as const };
    if (magnitude >= 5) return { text: "MODERATE", variant: "secondary" as const };
    return { text: "MINOR", variant: "outline" as const };
  };

  const formatTime = (time: string) => {
    const date = new Date(time);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-primary animate-pulse-slow" />
            <div>
              <h1 className="text-2xl font-bold text-gradient">ResQHub</h1>
              <p className="text-xs text-muted-foreground">Real-time Earthquake Monitoring</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/safety")}>
              Safety Guide
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/settings")}>
              Settings
            </Button>
            <Button size="sm" onClick={() => navigate("/chatbot")} className="glow-red">
              <MessageSquare className="h-4 w-4 mr-2" />
              AI Assistant
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/logout")}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Alerts</p>
                <p className="text-2xl font-bold text-foreground">{alerts.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </Card>
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical (M7+)</p>
                <p className="text-2xl font-bold text-alert-critical">
                  {alerts.filter(a => a.magnitude >= 7).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-alert-critical" />
            </div>
          </Card>
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Severe (M6+)</p>
                <p className="text-2xl font-bold text-alert-warning">
                  {alerts.filter(a => a.magnitude >= 6 && a.magnitude < 7).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-alert-warning" />
            </div>
          </Card>
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Last 24h</p>
                <p className="text-2xl font-bold text-foreground">
                  {alerts.filter(a => new Date(a.time) > new Date(Date.now() - 86400000)).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </Card>
        </div>

        {/* Recent Alerts */}
        <Card className="p-6 bg-card border-border">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Recent Earthquakes
          </h2>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading alerts...</div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No recent earthquakes</div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => {
                const badge = getAlertBadge(alert.magnitude);
                return (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-4 bg-secondary rounded-lg border border-border hover:bg-secondary/80 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant={badge.variant} className="font-bold">
                          {badge.text}
                        </Badge>
                        <span className={`text-2xl font-bold text-${getMagnitudeColor(alert.magnitude)}`}>
                          M{alert.magnitude}
                        </span>
                        {alert.tsunami_warning && (
                          <Badge variant="destructive" className="animate-pulse">TSUNAMI</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <MapPin className="h-4 w-4" />
                        <span>{alert.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(alert.time)}</span>
                        <span>•</span>
                        <span>Depth: {alert.depth_km}km</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/map?lat=${alert.latitude}&lng=${alert.longitude}`)}>
                      View Map
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
