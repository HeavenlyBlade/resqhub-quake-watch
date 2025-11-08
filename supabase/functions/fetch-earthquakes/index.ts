import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch recent earthquakes from USGS API
    const usgsUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson";
    const response = await fetch(usgsUrl);
    
    if (!response.ok) {
      throw new Error(`USGS API error: ${response.status}`);
    }

    const data = await response.json();
    const earthquakes = data.features;

    // Process and store earthquakes
    for (const quake of earthquakes) {
      const props = quake.properties;
      const coords = quake.geometry.coordinates;

      // Check if already exists
      const { data: existing } = await supabase
        .from('earthquake_alerts')
        .select('id')
        .eq('earthquake_id', quake.id)
        .single();

      if (!existing) {
        // Insert new earthquake
        await supabase.from('earthquake_alerts').insert({
          earthquake_id: quake.id,
          magnitude: props.mag,
          location: props.place,
          latitude: coords[1],
          longitude: coords[0],
          depth_km: coords[2],
          time: new Date(props.time).toISOString(),
          significance: props.sig,
          alert_level: props.alert,
          felt_reports: props.felt || 0,
          tsunami_warning: props.tsunami === 1,
          url: props.url,
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: earthquakes.length,
        message: "Earthquake data updated successfully" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in fetch-earthquakes function:", error);
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
