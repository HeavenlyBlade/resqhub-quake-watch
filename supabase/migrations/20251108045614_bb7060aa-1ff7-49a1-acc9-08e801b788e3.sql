-- Create user preferences table for alert customization
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  location_name TEXT,
  min_magnitude DECIMAL(3, 1) DEFAULT 4.0,
  alert_radius_km INTEGER DEFAULT 500,
  push_notifications BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for user preferences
CREATE POLICY "Users can view own preferences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON public.user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Create cached earthquake alerts table
CREATE TABLE public.earthquake_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  earthquake_id TEXT UNIQUE NOT NULL,
  magnitude DECIMAL(3, 1) NOT NULL,
  location TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  depth_km DECIMAL(6, 2),
  time TIMESTAMPTZ NOT NULL,
  significance INTEGER,
  alert_level TEXT,
  felt_reports INTEGER DEFAULT 0,
  tsunami_warning BOOLEAN DEFAULT false,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for earthquake alerts (public read)
ALTER TABLE public.earthquake_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view earthquake alerts"
  ON public.earthquake_alerts FOR SELECT
  USING (true);

-- Only system can insert/update alerts (via service role)
CREATE POLICY "Service role can manage alerts"
  ON public.earthquake_alerts FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Create safety guides table
CREATE TABLE public.safety_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  icon TEXT,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.safety_guides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view safety guides"
  ON public.safety_guides FOR SELECT
  USING (true);

-- Insert default safety guides
INSERT INTO public.safety_guides (title, category, content, icon, priority) VALUES
('During an Earthquake', 'immediate', 'DROP to your hands and knees. COVER your head and neck under a sturdy table or desk. HOLD ON until the shaking stops. Stay away from windows and outside walls.', 'shield-alert', 1),
('After an Earthquake', 'response', 'Check yourself for injuries. Help others if you can. Inspect your home for damage. Be prepared for aftershocks. Listen to emergency broadcasts for information.', 'radio', 2),
('Emergency Kit', 'preparation', 'Keep a 3-day supply of water (1 gallon per person per day). Non-perishable food. First aid kit. Flashlight and extra batteries. Whistle. Important documents in waterproof container.', 'package', 3),
('Evacuation Routes', 'preparation', 'Know your evacuation routes. Have a family meeting point. Keep important contacts written down. Practice earthquake drills regularly. Know how to turn off utilities.', 'map', 4),
('Tsunami Safety', 'immediate', 'If near coast and earthquake lasts >20 seconds or magnitude >7.0, move to high ground immediately. Do not wait for official warning. Tsunami can arrive within minutes.', 'waves', 5);

-- Create indexes for better query performance
CREATE INDEX idx_earthquake_alerts_time ON public.earthquake_alerts(time DESC);
CREATE INDEX idx_earthquake_alerts_magnitude ON public.earthquake_alerts(magnitude DESC);
CREATE INDEX idx_earthquake_alerts_location ON public.earthquake_alerts(latitude, longitude);
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_safety_guides_updated_at
  BEFORE UPDATE ON public.safety_guides
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();