import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShieldAlert, Radio, Package, Map, Waves } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SafetyGuide {
  id: string;
  title: string;
  category: string;
  content: string;
  icon: string;
  priority: number;
}

const Safety = () => {
  const [guides, setGuides] = useState<SafetyGuide[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    const { data } = await supabase
      .from('safety_guides')
      .select('*')
      .order('priority', { ascending: true });

    setGuides(data || []);
  };

  const getIcon = (iconName: string) => {
    const icons = {
      'shield-alert': ShieldAlert,
      'radio': Radio,
      'package': Package,
      'map': Map,
      'waves': Waves,
    };
    return icons[iconName as keyof typeof icons] || ShieldAlert;
  };

  const getCategoryBadge = (category: string) => {
    const badges = {
      immediate: { text: "IMMEDIATE ACTION", variant: "destructive" as const },
      response: { text: "RESPONSE", variant: "secondary" as const },
      preparation: { text: "PREPARATION", variant: "outline" as const },
    };
    return badges[category as keyof typeof badges] || { text: category.toUpperCase(), variant: "outline" as const };
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
            <h1 className="text-2xl font-bold text-gradient">Safety Guidelines</h1>
            <p className="text-xs text-muted-foreground">Essential earthquake safety information</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {guides.map((guide) => {
            const Icon = getIcon(guide.icon);
            const badge = getCategoryBadge(guide.category);
            
            return (
              <Card key={guide.id} className="p-6 bg-card border-border hover:border-primary transition-colors">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-foreground">{guide.title}</h3>
                      <Badge variant={badge.variant}>{badge.text}</Badge>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{guide.content}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Emergency Contacts */}
        <Card className="mt-8 p-6 bg-card border-primary/50">
          <h2 className="text-xl font-bold mb-4 text-primary">Emergency Contacts</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Philippines</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Emergency Hotline: 911</li>
                <li>• NDRRMC: (02) 8911-5061 to 65</li>
                <li>• PHIVOLCS: (02) 8426-1468 to 79</li>
                <li>• Red Cross: 143</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">International</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• USGS: usgs.gov</li>
                <li>• WHO: who.int</li>
                <li>• IFRC: ifrc.org</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Safety;
