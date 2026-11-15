import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
  const pipelineBaseUrl = process.env.DATA_PIPELINE_URL;

  if (!pipelineBaseUrl) {
    return NextResponse.json(
      {
        service: 'app',
        bound_service: 'data-pipeline',
        status: 'standalone',
        message: 'DATA_PIPELINE_URL binding not present (running in standalone mode)',
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  try {
    const targetUrl = new URL('status', pipelineBaseUrl.endsWith('/') ? pipelineBaseUrl : `${pipelineBaseUrl}/`);
    const res = await fetch(targetUrl, {
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      return NextResponse.json(
        {
          service: 'app',
          error: `Data-pipeline returned HTTP ${res.status}`,
        },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({
      service: 'app',
      bound_service: 'data-pipeline',
      data,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        service: 'app',
        error: 'Failed to reach bound data-pipeline service',
        details: err?.message,
      },
      { status: 502 }
    );
  }
}
