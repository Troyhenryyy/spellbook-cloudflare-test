import fs from 'fs/promises';
import path from 'path';
import Typesense from 'typesense';
import dotenv from 'dotenv';
import { slugify } from '../src/utils/slugify.js';


dotenv.config();


const DATA_DIR = path.join(process.cwd(), 'data', 'spells');



const client = new Typesense.Client({
  nodes: [{
    host: process.env.PUBLIC_TYPESENSE_HOST || 'localhost',
    port: process.env.PUBLIC_TYPESENSE_PORT || '8108',
    protocol: process.env.PUBLIC_TYPESENSE_PROTOCOL || 'http'
  }],
  apiKey: process.env.TYPESENSE_API_KEY,
  connectionTimeoutSeconds: 10 
});

const schema = {
  name: 'spells',
  fields: [
    { name: 'name', type: 'string', infix: true },
    { name: 'slug', type: 'string' },
    { name: 'level', type: 'int32', facet: true },
    { name: 'school', type: 'string', facet: true },
    { name: 'classes', type: 'string[]', facet: true },
    { name: 'description', type: 'string' },
    { name: 'source', type: 'string', facet: true },
  ],
  default_sorting_field: 'level'
};


const schoolMap = { 
  'E': 'Evocation', 'A': 'Abjuration', 'C': 'Conjuration', 
  'D': 'Divination', 'EN': 'Enchantment', 'V': 'Evocation', 
  'I': 'Illusion', 'N': 'Necromancy', 'T': 'Transmutation' 
};


function extractText(entries) {
  if (!entries) return '';
  if (typeof entries === 'string') return entries;
  if (Array.isArray(entries)) return entries.map(extractText).join(' ');
  if (typeof entries === 'object' && entries.entries) return extractText(entries.entries);
  return '';
}

async function run() {
  try {
    console.log(`🔍 Scanning directory: ${DATA_DIR}`);
    

    let files = [];
    try {
        files = await fs.readdir(DATA_DIR);
    } catch (e) {
        console.error(`❌ Could not read directory. Are your JSON files in 'data/spells'?`);
        process.exit(1);
    }
    

    const spellFiles = files.filter(f => f.startsWith('spells-') && f.endsWith('.json'));

    console.log(`📚 Found ${spellFiles.length} spell books.`);
    
    let allSpells = [];


    for (const file of spellFiles) {
      const content = await fs.readFile(path.join(DATA_DIR, file), 'utf-8');
      const json = JSON.parse(content);
      const spellList = json.spell || [];

 
      
      const formatted = spellList.map(s => ({
        id: slugify(s.name),
        name: s.name,
        slug: slugify(s.name),
        level: s.level,
        school: schoolMap[s.school] || s.school,
        classes: s.fromClassList ? s.fromClassList.map(c => c.name) : [],
        description: extractText(s.entries),
        source: s.source
      }));

      allSpells = [...allSpells, ...formatted];
    }
    console.log(`\n✨ Parsed ${allSpells.length} total spells.`);


    console.log(' Deleting old index...');
    try { await client.collections('spells').delete(); } catch (e) {}
    
    console.log(' Creating new schema...');
    await client.collections().create(schema);

  
    console.log(' Uploading to Typesense...');
    const BATCH_SIZE = 500;
    for (let i = 0; i < allSpells.length; i += BATCH_SIZE) {
        const chunk = allSpells.slice(i, i + BATCH_SIZE);
        await client.collections('spells').documents().import(chunk, { action: 'upsert' });
        console.log(`   ...uploaded spells ${i + 1} to ${Math.min(i + BATCH_SIZE, allSpells.length)}`);
    }

    console.log('✅ Indexing Complete!');

  } catch (error) {
    console.error('❌ Script Failed:', error);
  }
}

run();