// main.js
import tsj from "ts-json-schema-generator";
import fs from"fs";
import { fileURLToPath } from 'url';

/** @type {import('ts-json-schema-generator/dist/src/Config').Config} */
const config = {
  path: "../utils/src/index.ts",
  tsconfig: "../utils/tsconfig.json",
  type: "TokenCalcResponse", // Or <type-name> if you want to generate schema for that one type only
  skipTypeCheck: true,
};


function main() {
  const outputPath = "dist/TokenCalcResponse.schema.json";
  // Ensure dist exists
  if (!fs.existsSync("dist")) {
    fs.mkdirSync("dist");
  }
  const schema = tsj.createGenerator(config).createSchema(config.type);
  const schemaString = JSON.stringify(schema, null, 2);
  fs.writeFile(outputPath, schemaString, (err) => {
    if (err) throw err;
    console.log(`Schema generated at ${outputPath}`);
  });
}

// Fixed isMain check for ESM
const isMain = process.argv[1] && (process.argv[1] === fileURLToPath(import.meta.url) || import.meta.url.endsWith(process.argv[1]));

if (isMain) {
  main();
}


