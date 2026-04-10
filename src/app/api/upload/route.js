import { NextResponse } from 'next/server';

// Global variable for demo storage (will reset on serverless function sleep)
global.photos = global.photos || [];

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get('file');

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Convert to base64 string
    const base64Data = buffer.toString('base64');
    const mimeType = file.type || 'image/jpeg';
    const photoUrl = `data:${mimeType};base64,${base64Data}`;

    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    
    // Add to in-memory global array for the gallery to read during demo
    global.photos.unshift({
      url: photoUrl,
      name: filename,
      time: Date.now()
    });
    
    // Keep only last 20 for memory safety
    if (global.photos.length > 20) global.photos.pop();

    return NextResponse.json({ success: true, fileUrl: photoUrl });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 });
  }
}
