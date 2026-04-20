#!/usr/bin/env node
import { extractBearerToken, formatBearerOutput } from './bearer.js';
import { fetchPageHtml } from './extractor.js';

function parseArgs(argv) {
  const args = {
    page: 'https://www.hellofresh.lu/plans',
    raw: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    if (!current.startsWith('--')) {
      continue;
    }

    const key = current.slice(2);
    if (key === 'raw') {
      args.raw = true;
      continue;
    }

    args[key] = argv[index + 1];
    index += 1;
  }

  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const html = await fetchPageHtml(args.page);
  const payload = extractBearerToken(html, args.page);
  console.log(formatBearerOutput(payload, { raw: args.raw }));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
