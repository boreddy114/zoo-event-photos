import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

global.photos = global.photos || [];

export async function POST(request) {
  try {
    const { image, overlay } = await request.json();

    if (!image) {
      return NextResponse.json({ success: false, error: "No image provided" }, { status: 400 });
    }

    const filename = `${Date.now()}-photo.jpg`;
    let fileUrl = image;
    let fallbackToMemory = true;

    if (supabase) {
      try {
        // Prepare base64 for Upload
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        const imageBuffer = Buffer.from(base64Data, "base64");

        // Upload to Storage
        const { data: storageData, error: storageError } = await supabase.storage
          .from('photos')
          .upload(filename, imageBuffer, { contentType: 'image/jpeg', upsert: false });

        if (storageError) throw storageError;

        // Get public URL
        const { data: publicUrlData } = supabase.storage.from('photos').getPublicUrl(filename);
        fileUrl = publicUrlData.publicUrl;

        // Insert into table
        const { error: dbError } = await supabase
          .from('event_photos')
          .insert([{ url: fileUrl, overlay: overlay }]);

        if (dbError) throw dbError;

        fallbackToMemory = false;
      } catch (err) {
        console.error("Supabase Upload Error:", err);
        console.warn("Falling back to local memory storage...");
      }
    }

    if (fallbackToMemory) {
      global.photos.unshift({ url: fileUrl, name: filename, time: Date.now() });
      if (global.photos.length > 30) global.photos.pop();
    }

    return NextResponse.json({ success: true, fileUrl });
  } catch (error) {
    console.error("Base64 Upload Error:", error);
    return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 });
  }
}
