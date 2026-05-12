#!/usr/bin/env node
/**
 * validate-schema.js
 * Validates notices.json against notices.schema.json using ajv.
 * Exits 1 on any validation error so GitHub Actions marks the check as failed.
 */
 
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
 
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
 
const noticesPath = resolve(ROOT, 'notices.json');
const schemaPath  = resolve(ROOT, 'notices.schema.json');
 
let notices, schema;
try {
  notices = JSON.parse(readFileSync(noticesPath, 'utf8'));
} catch (e) {
  console.error(`❌ Could not parse notices.json: ${e.message}`);
  process.exit(1);
}
try {
  schema = JSON.parse(readFileSync(schemaPath, 'utf8'));
} catch (e) {
  console.error(`❌ Could not parse notices.schema.json: ${e.message}`);
  process.exit(1);
}
 
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const validate = ajv.compile(schema);
 
if (validate(notices)) {
  console.log(`✅ notices.json is valid (${notices.length} notice(s) checked).`);
  process.exit(0);
} else {
  console.error(`❌ notices.json failed schema validation:\n`);
  for (const err of validate.errors) {
    console.error(`  • ${err.instancePath || '(root)'}: ${err.message}`);
    if (err.params) {
      console.error(`    params: ${JSON.stringify(err.params)}`);
    }
  }
  process.exit(1);
}
