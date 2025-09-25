import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path') || 'files/portfolio';
    
    // Security: Only allow access to files in the public/files directory
    if (path.includes('..') || !path.startsWith('files/')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    const fullPath = join(process.cwd(), 'public', path);
    
    try {
      const items = await readdir(fullPath);
      const files = await Promise.all(
        items.map(async (item) => {
          const itemPath = join(fullPath, item);
          const stats = await stat(itemPath);
          const extension = item.includes('.') ? item.split('.').pop()?.toLowerCase() : undefined;
          
          return {
            id: `${path}/${item}`,
            name: item,
            type: stats.isDirectory() ? 'folder' : 'file',
            size: stats.isFile() ? stats.size : undefined,
            lastModified: stats.mtime,
            path: `${path}/${item}`,
            extension,
            isDirectory: stats.isDirectory(),
          };
        })
      );
      
      // Sort: directories first, then files, both alphabetically
      files.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });
      
      return NextResponse.json({ files });
    } catch (error) {
      console.error('Error reading directory:', error);
      return NextResponse.json({ error: 'Directory not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
