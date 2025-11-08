import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    location_name: "",
    location_lat: "",
    location_lng: "",
    min_magnitude: "4.0",
    alert_radius_km: "500",
    push_notifications: true,
    email_notifications: false,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setPreferences({
        location_name: data.location_name || "",
        location_lat: data.location_lat?.toString() || "",
        location_lng: data.location_lng?.toString() || "",
        min_magnitude: data.min_magnitude?.toString() || "4.0",
        alert_radius_km: data.alert_radius_km?.toString() || "500",
        push_notifications: data.push_notifications,
        email_notifications: data.email_notifications,
      });
    }
  };

  const savePreferences = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          location_name: preferences.location_name,
          location_lat: preferences.location_lat ? parseFloat(preferences.location_lat) : null,
          location_lng: preferences.location_lng ? parseFloat(preferences.location_lng) : null,
          min_magnitude: parseFloat(preferences.min_magnitude),
          alert_radius_km: parseInt(preferences.alert_radius_km),
          push_notifications: preferences.push_notifications,
          email_notifications: preferences.email_notifications,
        });

      if (error) throw error;
      toast.success("Preferences saved successfully");
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error("Failed to save preferences");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gradient">Alert Settings</h1>
            <p className="text-xs text-muted-foreground">Customize your earthquake alerts</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="p-6 bg-card border-border space-y-6">
          {/* Location Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Location Settings</h2>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location_name">Location Name</Label>
              <Input
                id="location_name"
                value={preferences.location_name}
                onChange={(e) => setPreferences({...preferences, location_name: e.target.value})}
                placeholder="e.g., Manila, Philippines"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location_lat">Latitude</Label>
                <Input
                  id="location_lat"
                  type="number"
                  step="0.000001"
                  value={preferences.location_lat}
                  onChange={(e) => setPreferences({...preferences, location_lat: e.target.value})}
                  placeholder="14.5995"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location_lng">Longitude</Label>
                <Input
                  id="location_lng"
                  type="number"
                  step="0.000001"
                  value={preferences.location_lng}
                  onChange={(e) => setPreferences({...preferences, location_lng: e.target.value})}
                  placeholder="120.9842"
                />
              </div>
            </div>
          </div>

          {/* Alert Thresholds */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Alert Thresholds</h2>
            
            <div className="space-y-2">
              <Label htmlFor="min_magnitude">Minimum Magnitude</Label>
              <Input
                id="min_magnitude"
                type="number"
                step="0.1"
                min="1"
                max="10"
                value={preferences.min_magnitude}
                onChange={(e) => setPreferences({...preferences, min_magnitude: e.target.value})}
              />
              <p className="text-xs text-muted-foreground">
                Only show earthquakes at or above this magnitude
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alert_radius_km">Alert Radius (km)</Label>
              <Input
                id="alert_radius_km"
                type="number"
                step="50"
                min="0"
                value={preferences.alert_radius_km}
                onChange={(e) => setPreferences({...preferences, alert_radius_km: e.target.value})}
              />
              <p className="text-xs text-muted-foreground">
                Distance from your location to receive alerts
              </p>
            </div>
          </div>

          {/* Notifications */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Notifications</h2>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push_notifications">Push Notifications</Label>
                <p className="text-xs text-muted-foreground">Get instant alerts on your device</p>
              </div>
              <Switch
                id="push_notifications"
                checked={preferences.push_notifications}
                onCheckedChange={(checked) => setPreferences({...preferences, push_notifications: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email_notifications">Email Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive alert summaries via email</p>
              </div>
              <Switch
                id="email_notifications"
                checked={preferences.email_notifications}
                onCheckedChange={(checked) => setPreferences({...preferences, email_notifications: checked})}
              />
            </div>
          </div>

          <Button onClick={savePreferences} disabled={loading} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Saving..." : "Save Preferences"}
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
