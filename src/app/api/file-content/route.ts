import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');
    
    if (!filePath) {
      return NextResponse.json({ error: 'File path is required' }, { status: 400 });
    }
    
    // Security: Only allow access to files in the public/files directory
    if (filePath.includes('..') || !filePath.startsWith('files/')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    const fullPath = join(process.cwd(), 'public', filePath);
    
    try {
      const content = await readFile(fullPath, 'utf-8');
      return NextResponse.json({ content });
    } catch (error) {
      console.error('Error reading file:', error);
      return NextResponse.json({ error: 'File not found or cannot be read' }, { status: 404 });
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
