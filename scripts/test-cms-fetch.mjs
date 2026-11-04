/* global console */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

// Parse .env.local manually to ensure zero Next.js runtime interference
const envPath = path.resolve(process.cwd(), '.env.local');
let token = process.env.STORYBLOK_TOKEN;

if (!token && fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('STORYBLOK_TOKEN=')) {
      token = trimmed.split('=')[1].replace(/["']/g, '').trim();
      break;
    }
  }
}

if (!token) {
  console.error('\x1b[31m[ERROR]\x1b[0m STORYBLOK_TOKEN is missing from .env.local');
  process.exit(1);
}

const targetSlug = process.argv[2] || 'home';
const version = 'draft'; // test draft first to see pending content

console.log(`\x1b[34m[INFO]\x1b[0m Querying Storyblok Delivery API for story: "${targetSlug}" (version: ${version})...`);

const url = `https://api.storyblok.com/v2/cdn/stories/${targetSlug}?version=${version}&token=${token}`;

try {
  const res = await globalThis.fetch(url);
  const data = await res.json();

  if (!res.ok) {
    console.error(`\x1b[31m[FAIL]\x1b[0m Storyblok API responded with HTTP ${res.status}:`, data);
    process.exit(1);
  }

  const story = data.story;
  console.log(`\x1b[32m[SUCCESS]\x1b[0m Connected to Storyblok!`);
  console.log(`- Story Name: ${story.name}`);
  console.log(`- Story ID: ${story.id}`);
  console.log(`- Content Component (Root Blok): ${story.content?.component}`);
  console.log('\n--- ROOT CONTENT FIELDS ---');
  console.log(JSON.stringify(story.content, null, 2));
  
  const bloks = story.content?.body || [];
  console.log(`- Registered Child Bloks in body: ${bloks.length}`);
  bloks.forEach((blok, i) => {
    console.log(`  [${i + 1}] component: "${blok.component}" (id: ${blok._uid})`);
  });
} catch (err) {
  console.error('\x1b[31m[ERROR]\x1b[0m Network error communicating with Storyblok:', err.message);
  process.exit(1);
}