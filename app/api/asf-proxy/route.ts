import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const bbox = searchParams.get('bbox') || '';
  const platform = searchParams.get('platform') || 'NISAR';
  const start = searchParams.get('start') || '';
  const end = searchParams.get('end') || '';
  const maxResults = searchParams.get('maxResults') || '25';

  const asfUrl = new URL('https://api.daac.asf.alaska.edu/services/search/param');
  asfUrl.searchParams.set('output', 'geojson');
  asfUrl.searchParams.set('maxResults', maxResults);
  if (bbox) asfUrl.searchParams.set('bbox', bbox);
  if (platform) asfUrl.searchParams.set('platform', platform);
  if (start) asfUrl.searchParams.set('start', start);
  if (end) asfUrl.searchParams.set('end', end);

  try {
    const res = await fetch(asfUrl.toString(), {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `ASF returned ${res.status}` },
        { status: res.status }
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to reach ASF Vertex', details: String(err) },
      { status: 502 }
    );
  }
}
