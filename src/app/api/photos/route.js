import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

global.photos = global.photos || [];

export async function GET() {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('event_photos')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        // Map Supabase rows to the format expected by the frontend
        const parsedPhotos = data.map(p => ({
          url: p.url,
          name: p.id,
          time: new Date(p.created_at).getTime()
        }));
        return NextResponse.json({ success: true, photos: parsedPhotos });
      }
    }
    
    // Fallback to local memory storage
    return NextResponse.json({ success: true, photos: global.photos });
  } catch (error) {
    console.error("Photos Error:", error);
    // Even if Supabase crashes, return memory so the gallery doesn't completely die
    return NextResponse.json({ success: true, photos: global.photos });
  }
}
