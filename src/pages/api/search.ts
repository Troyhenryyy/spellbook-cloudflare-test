import Typesense from 'typesense';

// CRITICAL: Run as a server function (Worker), not static HTML
export const prerender = false;


const client = new Typesense.Client({
  nodes: [{
    host: import.meta.env.PUBLIC_TYPESENSE_HOST || 'localhost',
    port: import.meta.env.PUBLIC_TYPESENSE_PORT || '8108',
    protocol: import.meta.env.PUBLIC_TYPESENSE_PROTOCOL || 'http',
  }],

  apiKey: (import.meta.env.TYPESENSE_API_KEY || '').trim(),
  connectionTimeoutSeconds: 2
});


export async function GET({ request }: { request: Request }) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q');


  const level = url.searchParams.get('level');
  const school = url.searchParams.get('school');
  const dndClass = url.searchParams.get('class');


  if ((!query || query.length < 2) && !level && !school && !dndClass) {
    return new Response(JSON.stringify({ hits: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }


  const filterConditions = [];
  if (level) filterConditions.push(`level:=${level}`);
  if (school) filterConditions.push(`school:=${school}`);
  if (dndClass) filterConditions.push(`classes:=${dndClass}`);

  const filterString = filterConditions.join(' && ');

  try {
 
    const searchResults = await client.collections('spells').documents().search({
      q: query || '*', 
      query_by: 'name',
      per_page: 250,   
      filter_by: filterString,
      infix: 'always', 
    });

    return new Response(JSON.stringify(searchResults), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600' 
      }
    });

  } catch (error: any) {
    console.error("❌ Search Error:", error);
    
    return new Response(JSON.stringify({ 
      error: 'Search service unavailable',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}