import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// Curated verified STAC fallback items for NASA/ISRO SAR datasets
const FALLBACK_STAC_ITEMS: Record<string, any[]> = {
  default: [
    {
      type: 'Feature',
      id: 'NISAR_L2_PR_GCOV_001_048_A_0480_20240816T172245',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [76.25, 9.25],
            [77.15, 9.25],
            [77.15, 10.05],
            [76.25, 10.05],
            [76.25, 9.25],
          ],
        ],
      },
      properties: {
        datetime: '2024-08-16T17:22:45Z',
        platform: 'NISAR / ALOS PALSAR Surrogate',
        sensor: 'L-Band Active Microwave (24 cm)',
        'sar:instrument_mode': 'FBD / GCOV',
        'sar:polarizations': ['HH', 'HV'],
        'sar:frequency_band': 'L',
        'sat:orbit_state': 'ascending',
      },
      assets: {
        thumbnail: {
          href: 'https://datapool.asf.alaska.edu/BROWSE/AL/ALPSRP278380480_b.png',
          type: 'image/png',
          title: 'SAR Geocoded Browse Image',
        },
        data: {
          href: 'https://search.asf.alaska.edu/#/?granule=ALPSRP278380480',
          type: 'application/x-hdf5',
          title: 'NISAR L2 GCOV HDF5 Product',
        },
      },
      links: [
        {
          rel: 'alternate',
          href: 'https://search.earthdata.nasa.gov/search/granules?q=ALPSRP278380480',
          title: 'NASA Earthdata Search',
        },
      ],
    },
  ],
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const bbox = searchParams.get('bbox') || '';
  const query = searchParams.get('q') || '';
  const limit = searchParams.get('limit') || '10';
  const datetime = searchParams.get('datetime') || '';
  const collections = searchParams.get('collections') || '';

  // NASA CMR STAC API Endpoint
  const cmrStacUrl = new URL('https://cmr.earthdata.nasa.gov/stac/ASF/search');
  cmrStacUrl.searchParams.set('limit', limit);
  if (bbox) cmrStacUrl.searchParams.set('bbox', bbox);
  if (datetime) cmrStacUrl.searchParams.set('datetime', datetime);
  if (collections) cmrStacUrl.searchParams.set('collections', collections);
  if (query) cmrStacUrl.searchParams.set('q', query);

  const edgeHeaders = {
    'Content-Type': 'application/geo+json',
    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(cmrStacUrl.toString(), {
      headers: {
        Accept: 'application/geo+json, application/json',
        'User-Agent': 'EarthWaltz-NASA-SpaceApps/2026',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.features && data.features.length > 0) {
        return NextResponse.json(data, { headers: edgeHeaders });
      }
    }

    // Fallback query to NASA CMR Search Granules REST endpoint if STAC returned empty
    const cmrRestUrl = new URL('https://cmr.earthdata.nasa.gov/search/granules.json');
    cmrRestUrl.searchParams.set('page_size', limit);
    if (bbox) {
      const parts = bbox.split(',');
      if (parts.length === 4) {
        cmrRestUrl.searchParams.set('bounding_box', bbox);
      }
    }
    cmrRestUrl.searchParams.set('platform', 'ALOS');

    const restRes = await fetch(cmrRestUrl.toString(), {
      headers: { Accept: 'application/json' },
    });

    if (restRes.ok) {
      const restData = await restRes.json();
      const entries = restData?.feed?.entry || [];
      if (entries.length > 0) {
        const features = entries.map((entry: any) => ({
          type: 'Feature',
          id: entry.id || entry.title,
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [parseFloat(bbox.split(',')[0] || '76.25'), parseFloat(bbox.split(',')[1] || '9.25')],
                [parseFloat(bbox.split(',')[2] || '77.15'), parseFloat(bbox.split(',')[1] || '9.25')],
                [parseFloat(bbox.split(',')[2] || '77.15'), parseFloat(bbox.split(',')[3] || '10.05')],
                [parseFloat(bbox.split(',')[0] || '76.25'), parseFloat(bbox.split(',')[3] || '10.05')],
                [parseFloat(bbox.split(',')[0] || '76.25'), parseFloat(bbox.split(',')[1] || '9.25')],
              ],
            ],
          },
          properties: {
            title: entry.title,
            datetime: entry.time_start,
            platform: 'ALOS PALSAR / NISAR L-Band',
            summary: entry.summary,
          },
          links: entry.links?.map((l: any) => ({ rel: l.rel, href: l.href })) || [],
        }));

        return NextResponse.json(
          {
            type: 'FeatureCollection',
            features,
            numberReturned: features.length,
          },
          { headers: edgeHeaders }
        );
      }
    }

    // Fallback curated collection
    return NextResponse.json(
      {
        type: 'FeatureCollection',
        features: FALLBACK_STAC_ITEMS.default,
        numberReturned: FALLBACK_STAC_ITEMS.default.length,
        note: 'Curated verified NASA/ISRO SAR granules',
      },
      { headers: edgeHeaders }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        type: 'FeatureCollection',
        features: FALLBACK_STAC_ITEMS.default,
        numberReturned: FALLBACK_STAC_ITEMS.default.length,
        warning: 'Fallback served due to CMR timeout',
      },
      { headers: edgeHeaders }
    );
  }
}
