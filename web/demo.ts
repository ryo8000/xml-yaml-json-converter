import { convert } from '../src/formatConverter';
import { SupportedFormat } from '../src/types';

/**
 * Browser demo for the XML / YAML / JSON converter.
 *
 * This entry point reuses the exact same `convert` function that powers the
 * serverless API, so the demo can never drift from the real conversion logic.
 * It is bundled for the browser with esbuild (see `npm run build:demo`) and
 * runs entirely client-side — no request ever leaves the page.
 */

const SAMPLES: Record<SupportedFormat, string> = {
  json: [
    '{',
    '  "name": "John Doe",',
    '  "age": 30,',
    '  "languages": ["Go", "TypeScript", "Python"],',
    '  "address": {',
    '    "city": "Tokyo",',
    '    "zip": "100-0001"',
    '  }',
    '}',
  ].join('\n'),
  yaml: [
    'name: John Doe',
    'age: 30',
    'languages:',
    '  - Go',
    '  - TypeScript',
    '  - Python',
    'address:',
    '  city: Tokyo',
    "  zip: '100-0001'",
    '',
  ].join('\n'),
  xml: [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<person>',
    '  <name>John Doe</name>',
    '  <age>30</age>',
    '  <languages>Go</languages>',
    '  <languages>TypeScript</languages>',
    '  <languages>Python</languages>',
    '  <address>',
    '    <city>Tokyo</city>',
    '    <zip>100-0001</zip>',
    '  </address>',
    '</person>',
  ].join('\n'),
};

const byId = <T extends HTMLElement>(id: string): T => {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`Missing element #${id}`);
  }
  return el as T;
};

const input = byId<HTMLTextAreaElement>('input');
const output = byId<HTMLTextAreaElement>('output');
const fromSelect = byId<HTMLSelectElement>('from');
const toSelect = byId<HTMLSelectElement>('to');
const errorBox = byId<HTMLDivElement>('error');
const swapButton = byId<HTMLButtonElement>('swap');
const copyButton = byId<HTMLButtonElement>('copy');
const sampleButton = byId<HTMLButtonElement>('sample');

const setError = (message: string): void => {
  errorBox.textContent = message;
  errorBox.hidden = message === '';
};

const run = (): void => {
  const from = fromSelect.value as SupportedFormat;
  const to = toSelect.value as SupportedFormat;
  const data = input.value;

  if (data.trim() === '') {
    output.value = '';
    setError('');
    return;
  }

  try {
    output.value = convert(data, from, to);
    setError('');
  } catch (error) {
    output.value = '';
    setError((error as Error).message || String(error));
  }
};

let debounceTimer: number | undefined;
const scheduleRun = (): void => {
  window.clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(run, 150);
};

input.addEventListener('input', scheduleRun);
fromSelect.addEventListener('change', run);
toSelect.addEventListener('change', run);

swapButton.addEventListener('click', () => {
  const previousFrom = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = previousFrom;
  // Feed the converted output back in so a swap round-trips the data.
  if (output.value.trim() !== '') {
    input.value = output.value;
  }
  run();
});

sampleButton.addEventListener('click', () => {
  input.value = SAMPLES[fromSelect.value as SupportedFormat];
  run();
});

copyButton.addEventListener('click', async () => {
  if (output.value === '') {
    return;
  }
  try {
    await navigator.clipboard.writeText(output.value);
    const label = copyButton.textContent;
    copyButton.textContent = 'Copied!';
    window.setTimeout(() => {
      copyButton.textContent = label;
    }, 1200);
  } catch {
    // Clipboard access can be blocked (e.g. insecure context); ignore silently.
  }
});

// Load a sample on first paint so the page is never empty.
input.value = SAMPLES.json;
run();
