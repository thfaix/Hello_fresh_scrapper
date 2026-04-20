import { writeFile } from 'node:fs/promises';

import { renderHttpFile } from './http-template.js';

const outputPath = new URL('../HF_api.http', import.meta.url);
await writeFile(outputPath, renderHttpFile(), 'utf8');
console.log(outputPath.pathname);
