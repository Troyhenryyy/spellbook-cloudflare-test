/** @jsxImportSource preact */
import { useState, useEffect } from 'preact/hooks';
import SpellListTable from './SpellListTable';

function normalizeApiResults(hits: any[]) {
  return hits.map(hit => ({
    name: hit.document.name,
    slug: hit.document.slug,
    level: hit.document.level,
    school: hit.document.school,
    time: hit.document.time || '-',
    concentration: hit.document.concentration || false,
    range: hit.document.range || '-',
    source: hit.document.source || 'PHB',
    description: hit.document.description || '' 
  }));
}

export default function SpellBrowser({ initialSpells }: { initialSpells: any[] }) {
  const [query, setQuery] = useState('');
  const [spells, setSpells] = useState(initialSpells);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query) {
        setSpells(initialSpells);
        return;
      }

      setLoading(true);

      try {
        const params = new URLSearchParams();
        params.append('q', query);

        const res = await fetch(`/api/search?${params.toString()}`);
        
        if (!res.ok) throw new Error("API Request Failed");
        
        const data = await res.json();
        const cleanSpells = normalizeApiResults(data.hits || []);
        
        cleanSpells.sort((a: any, b: any) => a.name.localeCompare(b.name));
        setSpells(cleanSpells);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 400); // debounce, time before the search results pops uop

    return () => clearTimeout(timer);
  }, [query]); 


  // This part is where ung Search spell is and ung Table sa ilalim
  return (
    <div class="w-full max-w-6xl mx-auto">
      <div class="mb-8 flex flex-col gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div class="w-full">
          <label class="block text-sm font-bold text-slate-700 mb-1">Search Spells</label>
          <input
            type="text"
            placeholder="e.g. Fireball, Cure Wounds..."
            class="w-full p-3 border border-slate-300 rounded-lg shadow-inner text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            onInput={(e) => setQuery(e.currentTarget.value)}
            value={query}
          />
        </div>
        
        <div class="h-6 text-center">
            {loading && (
                <span class="text-sm font-semibold text-blue-600 animate-pulse">
                    Searching...
                </span>
            )}
        </div>
      </div>

      {/* code for spell table */}

      <div class="bg-white p-6 rounded-xl shadow-xl border border-stone-200">
        <div class="flex justify-between items-end mb-4 border-b border-stone-100 pb-2">
            <h2 class="text-2xl font-bold text-slate-800 font-serif">
                {query ? "Search Results" : "All Spells"}
            </h2>
            <span class="text-slate-500 text-sm font-medium">
                {spells.length} spells found
            </span>
            {/* displays the list of spells */}
        </div>
        
        <SpellListTable spells={spells} />
      </div>
    </div>
  );
}