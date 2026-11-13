import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const bbox = searchParams.get('bbox') || '';
  const limit = searchParams.get('limit') || '10';
  const collections = searchParams.get('collections') || 'NISAR_L1_GCOV_001_V1';

  const stacUrl = new URL('https://cmr.earthdata.nasa.gov/stac/ASF/search');
  stacUrl.searchParams.set('limit', limit);
  if (bbox) stacUrl.searchParams.set('bbox', bbox);
  if (collections) stacUrl.searchParams.set('collections', collections);
  if (query) stacUrl.searchParams.set('q', query);

  try {
    const res = await fetch(stacUrl.toString(), {
      headers: { Accept: 'application/geo+json' },
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `CMR STAC returned ${res.status}` },
        { status: res.status }
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to reach CMR STAC', details: String(err) },
      { status: 502 }
    );
  }
}
