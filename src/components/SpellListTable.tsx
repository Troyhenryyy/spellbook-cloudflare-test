/** @jsxImportSource preact */
import { useState } from 'preact/hooks';

// --- HELPERS ---
function formatSchool(code: string) {
  const map: Record<string, string> = { 
    'E': 'Evocation', 'A': 'Abjuration', 'C': 'Conjuration', 
    'D': 'Divination', 'EN': 'Enchantment', 'V': 'Evocation', 
    'I': 'Illusion', 'N': 'Necromancy', 'T': 'Transmutation' 
  };
  return map[code] || code;
}

function formatTime(time: any) {
  if (!time) return '-';
  if (typeof time === 'string') return time;
  if (Array.isArray(time) && time[0]) {
    const t = time[0];
    return `${t.number || ''} ${t.unit || ''}`.trim() || '-';
  }
  return '-';
}

function formatRange(range: any) {
  if (!range) return '-';
  if (range.type === 'point') {
    return `${range.distance?.amount || ''} ${range.distance?.type || 'ft'}`;
  }
  return range.type || '-';
}

// --- MAIN COMPONENT ---
export default function SpellListTable({ spells }: { spells: any[] }) {
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  const toggleRow = (slug: string) => {
    setExpandedSlug(prev => (prev === slug ? null : slug));
  };

  return (
    <div class="w-full font-sans">
      <div class="overflow-y-auto max-h-[75vh] shadow-md rounded-lg border border-gray-200 bg-white">
        <table class="w-full text-sm text-left text-gray-700 relative border-collapse">
          
          <thead class="text-xs text-white uppercase bg-slate-900 sticky top-0 z-10 shadow-sm">
            <tr>
              <th class="px-6 py-4 font-bold tracking-wider w-[25%]">Name</th>
              <th class="px-4 py-4 w-[10%]">Level</th>
              <th class="px-4 py-4 w-[15%]">School</th>
              <th class="px-4 py-4 w-[15%]">Time</th>
              <th class="px-4 py-4 w-[5%]">C.</th>
              <th class="px-4 py-4 w-[15%]">Range</th>
              <th class="px-4 py-4 w-[10%]">Source</th>
            </tr>
          </thead>
          
          <tbody class="divide-y divide-gray-200">
            {spells.length > 0 ? (
              spells.map((spell, index) => {
                const isExpanded = expandedSlug === spell.slug;
                
                return (
                  <>
                    {/* 1. THE CLICKABLE ROW */}
                    <tr 
                      key={`${spell.slug}-row`}
                      onClick={() => toggleRow(spell.slug)}
                      class={`cursor-pointer transition-colors border-b border-gray-100 
                        ${isExpanded ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : 'hover:bg-slate-50 border-l-4 border-l-transparent'}
                      `}
                    >
                      <td class="px-6 py-3 font-bold text-slate-900 flex items-center gap-3">
                        
                        {/* 
                           UPDATED ARROW ICON:
                           Using a raw SVG ensures it is always solid black (currentColor)
                           and never renders as an emoji.
                        */}
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 24 24" 
                          fill="currentColor" 
                          class={`w-3 h-3 text-black transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>

                        {spell.name}
                      </td>
                      <td class="px-4 py-3">{spell.level}</td>
                      <td class="px-4 py-3 text-slate-600">{formatSchool(spell.school)}</td>
                      <td class="px-4 py-3 capitalize">{formatTime(spell.time)}</td>
                      <td class="px-4 py-3">
                        {spell.concentration && <span class="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">C</span>}
                      </td>
                      <td class="px-4 py-3 capitalize">{formatRange(spell.range)}</td>
                      <td class="px-4 py-3 text-blue-800 font-semibold text-xs">{spell.source}</td>
                    </tr>

                    {/* 2. THE EXPANDED DETAIL ROW */}
                    {isExpanded && (
                      <tr key={`${spell.slug}-detail`} class="bg-indigo-50/50">
                        <td colSpan={7} class="p-0">
                          <div class="p-6 border-b border-indigo-100 flex flex-col md:flex-row gap-6 animate-fade-in">
                            
                            {/* Metadata Column */}
                            <div class="w-full md:w-1/4 space-y-4 text-sm border-r border-indigo-200 pr-6">
                              <div>
                                <div class="font-bold text-slate-900 uppercase text-xs mb-1">Level</div>
                                <div class="text-slate-700">{spell.level === 0 ? "Cantrip" : `${spell.level}st Level`}</div>
                              </div>
                              <div>
                                <div class="font-bold text-slate-900 uppercase text-xs mb-1">School</div>
                                <div class="text-slate-700">{formatSchool(spell.school)}</div>
                              </div>
                              <div>
                                <div class="font-bold text-slate-900 uppercase text-xs mb-1">Casting Time</div>
                                <div class="text-slate-700 capitalize">{formatTime(spell.time)}</div>
                              </div>
                              <div>
                                <div class="font-bold text-slate-900 uppercase text-xs mb-1">Range / Area</div>
                                <div class="text-slate-700 capitalize">{formatRange(spell.range)}</div>
                              </div>
                              <div>
                                <div class="font-bold text-slate-900 uppercase text-xs mb-1">Source</div>
                                <div class="text-slate-700">{spell.source}</div>
                              </div>
                            </div>

                            {/* Description Column */}
                            <div class="w-full md:w-3/4">
                              <h3 class="text-xl font-bold text-slate-800 mb-2">{spell.name}</h3>
                              <div class="prose prose-sm prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-line">
                                {spell.description || "No description available."}
                              </div>
                            </div>

                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} class="px-6 py-8 text-center text-gray-500 italic">
                  No spells found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div class="mt-2 text-right text-xs text-slate-400">
        Showing {spells.length} results
      </div>
    </div>
  );
}