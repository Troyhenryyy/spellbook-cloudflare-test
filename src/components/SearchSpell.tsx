/** @jsxImportSource preact */
import { useState, useEffect } from 'preact/hooks';

export default function SearchSpell() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Debounce logic: Wait 300ms after typing stops before searching
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      
      setLoading(true);
      try {
        // We will build this API route in the next step
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.hits || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div class="relative w-full max-w-lg mx-auto">
      <input
        type="text"
        placeholder="Search for a spell (e.g. Fireball)..."
        class="w-full p-4 border rounded shadow-lg text-lg"
        onInput={(e) => setQuery(e.currentTarget.value)}
      />
      
      {/* Dropdown Results */}
      {results.length > 0 && (
        <ul class="absolute top-full left-0 right-0 bg-white border mt-2 rounded shadow-xl z-50 max-h-96 overflow-y-auto">
          {results.map((hit) => (
            <li key={hit.document.id} class="border-b last:border-0 hover:bg-gray-50">
              <a href={`/spells/${hit.document.slug}`} class="block p-4">
                <div class="font-bold text-lg">{hit.document.name}</div>
                <div class="text-sm text-gray-600">
                   Level {hit.document.level} • {hit.document.school}
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}