export const prerender = false;

export async function GET({ request, locals }: { request: Request, locals: any }) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q');
  
  /**
   * SENIOR DEV TIP: Cloudflare Worker Environment Access
   * On Cloudflare, variables are sometimes on 'import.meta.env' 
   * and sometimes on 'locals.runtime.env'. We check both.
   */
  const runtimeEnv = locals.runtime?.env || {};
  
  const HOST = runtimeEnv.PUBLIC_TYPESENSE_HOST || import.meta.env.PUBLIC_TYPESENSE_HOST || 'localhost';
  const PORT = runtimeEnv.PUBLIC_TYPESENSE_PORT || import.meta.env.PUBLIC_TYPESENSE_PORT || '8108';
  const PROTOCOL = runtimeEnv.PUBLIC_TYPESENSE_PROTOCOL || import.meta.env.PUBLIC_TYPESENSE_PROTOCOL || 'http';
  const API_KEY = runtimeEnv.TYPESENSE_API_KEY || import.meta.env.TYPESENSE_API_KEY || '';

  // 1. Guard Clause: Validation
  if (!query || query.length < 2) {
    return new Response(JSON.stringify({ hits: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 2. Build the Search URL
  const typesenseUrl = `${PROTOCOL}://${HOST}:${PORT}/collections/spells/documents/search?` + new URLSearchParams({
    q: query,
    query_by: 'name',
    per_page: '250',
    infix: 'always'
  });

  try {
    // 3. Native Fetch (The most reliable way on Cloudflare Workers)
    const response = await fetch(typesenseUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-TYPESENSE-API-KEY': API_KEY.trim()
      }
    });

    if (!response.ok) {
      // If Typesense rejects us, we want to know why (401? 404?)
      const errorText = await response.text();
      throw new Error(`Typesense Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600'
      }
    });

  } catch (error: any) {
    // This will now show up in your Cloudflare Log Stream!
    console.error("❌ API CRASH:", error.message);

    return new Response(JSON.stringify({ 
      error: 'Search Failed',
      reason: error.message,
      // Helps us debug if the key was missing
      debug: { keyProvided: !!API_KEY, host: HOST }
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}