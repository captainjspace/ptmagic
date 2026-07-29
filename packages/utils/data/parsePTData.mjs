import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const dir = path.dirname(fileURLToPath(import.meta.url));
const csvPath = path.join(dir, "pt-models.csv");
const jsonPath = path.join(dir, "pt-models.json");

function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  const len = text.length;
  while (i < len) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (c === ",") {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (c === "\r") {
      i++;
      continue;
    }
    if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i++;
      continue;
    }
    field += c;
    i++;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function parseModelCell(cell) {
  const lines = cell
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  const name = lines[0];
  const versionLines = [];
  const noteLines = [];
  for (const line of lines.slice(1)) {
    const m = line.match(/^Latest supported version\s*(.*)$/i);
    if (m) {
      versionLines.push(m[1].replace(/^:\s*/, "").trim());
    } else if (line !== name) {
      noteLines.push(line);
    }
  }
  const result = { name };
  if (versionLines.length > 0) result.latestVersion = versionLines.join("; ");
  if (noteLines.length > 0) result.notes = noteLines.join(" ");
  return result;
}

function resolveModalityKey(text) {
  const t = text.toLowerCase();
  if (t.includes("session memory")) return "sessionMemory";
  if (t.includes("text") && t.includes("response")) return "response";
  if (t.includes("reasoning")) return "reasoning";
  if (t.includes("audio")) return "audio";
  if (t.includes("video")) return "video";
  if (t.includes("image")) return "image";
  if (t.includes("text")) return "text";
  return t.replace(/\s+/g, "_") || "all";
}

// Returns false if the clause label doesn't fit any known shape, so the
// caller can preserve the original line in `unparsed` instead of guessing.
function applyClause(target, rawLabel, multiplier) {
  const label = rawLabel.toLowerCase();

  if (/^cache write/.test(label)) {
    const key = label.includes("5m")
      ? "write5m"
      : label.includes("1h")
        ? "write1h"
        : "write";
    target.cache[key] = multiplier;
    return true;
  }
  if (label === "cache hit") {
    target.cache.hit = multiplier;
    return true;
  }

  let category;
  let remainder;
  if (label.startsWith("output")) {
    category = "output";
    remainder = label.slice("output".length).trim();
  } else if (label.startsWith("input")) {
    remainder = label.slice("input".length).trim();
    category = remainder.includes("cach") ? "inputCaching" : "input";
  } else {
    return false;
  }

  if (category === "inputCaching") {
    remainder = remainder.replace(/caching$/, "").replace(/cache$/, "").trim();
    if (remainder.includes(",")) {
      for (const part of remainder.split(",").map((p) => p.trim()).filter(Boolean)) {
        target.inputCaching[resolveModalityKey(part)] = multiplier;
      }
      return true;
    }
  }

  const key = remainder === "" ? "all" : resolveModalityKey(remainder);
  target[category][key] = multiplier;
  return true;
}

function emptyRateBucket() {
  return { input: {}, inputCaching: {}, output: {}, cache: {} };
}

function parseBurndown(cell) {
  const lines = cell.split("\n").map((l) => l.trim());
  const base = emptyRateBucket();
  const tiers = [];
  const unparsed = [];
  let target = base;

  for (const line of lines) {
    if (line === "") continue;

    const header = line.match(/^\*(.+):\*$/);
    if (header) {
      const label = header[1].trim();
      const thresholdMatch = label.match(/([\d,]+)/);
      const thresholdTokens = thresholdMatch
        ? Number(thresholdMatch[1].replace(/,/g, ""))
        : null;
      const lower = label.toLowerCase();
      let direction = "unknown";
      if (lower.includes("less than or equal")) direction = "lte";
      else if (lower.includes("less than")) direction = "lt";
      else if (lower.includes("greater than or equal")) direction = "gte";
      else if (lower.includes("greater than")) direction = "gt";
      target = emptyRateBucket();
      tiers.push({ label, thresholdTokens, direction, rates: target });
      continue;
    }

    const clause = line.match(/^1\s+(.+?)\s+tokens?\s*=\s*([\d.]+)\s+tokens?$/i);
    if (!clause) {
      unparsed.push(line);
      continue;
    }
    if (!applyClause(target, clause[1].trim(), Number(clause[2]))) {
      unparsed.push(line);
    }
  }

  const result = {};
  if (Object.values(base).some((bucket) => Object.keys(bucket).length > 0)) {
    result.base = base;
  }
  if (tiers.length > 0) result.tiers = tiers;
  if (unparsed.length > 0) result.unparsed = unparsed;
  return result;
}

function extractVeoRate(cell) {
  const m = cell.trim().match(/=\s*([\d.]+)/);
  return m ? Number(m[1]) : null;
}

function startModel(modelCell, throughputCell, minGSUCell, incrementCell, burndownCell) {
  const { name, latestVersion, notes } = parseModelCell(modelCell);
  const model = { name };
  if (latestVersion) model.latestVersion = latestVersion;
  if (notes) model.notes = notes;
  model.throughputPerGSU = Number(throughputCell.replace(/,/g, ""));
  model.gsuPurchaseIncrement = Number(incrementCell);

  if (/^veo\b/i.test(name)) {
    model.videoRates = [
      { unit: minGSUCell.trim(), ratePerBaseSecond: extractVeoRate(burndownCell) },
    ];
    return model;
  }

  const minGSU = minGSUCell.trim();
  model.minGSUPurchase = /^\d+$/.test(minGSU) ? Number(minGSU) : minGSU;
  model.burndown = parseBurndown(burndownCell);
  return model;
}

function addVeoSubRow(model, minGSUCell, burndownCell) {
  model.videoRates.push({
    unit: minGSUCell.trim(),
    ratePerBaseSecond: extractVeoRate(burndownCell),
  });
}

function run() {
  const raw = readFileSync(csvPath, "utf8");
  const rows = parseCSV(raw).filter((r) => r.some((f) => f.trim() !== ""));
  const [, ...dataRows] = rows;

  const models = [];
  let current = null;
  for (const [modelCell, throughputCell, minGSUCell, incrementCell, burndownCell] of dataRows) {
    const isContinuation = modelCell.trim() === "" && throughputCell.trim() === "";
    if (isContinuation) {
      addVeoSubRow(current, minGSUCell, burndownCell);
      continue;
    }
    current = startModel(modelCell, throughputCell, minGSUCell, incrementCell, burndownCell);
    models.push(current);
  }

  writeFileSync(jsonPath, JSON.stringify(models, null, 2) + "\n");

  const unparsedCount = models.reduce(
    (sum, m) => sum + (m.burndown?.unparsed?.length ?? 0),
    0,
  );
  const tieredCount = models.filter((m) => (m.burndown?.tiers?.length ?? 0) > 0).length;
  const videoCount = models.filter((m) => m.videoRates).length;
  console.log(
    `Parsed ${models.length} models (${tieredCount} tiered, ${videoCount} video) -> ${jsonPath}`,
  );
  if (unparsedCount > 0) {
    console.warn(`${unparsedCount} burndown clause(s) could not be classified — see "unparsed" fields.`);
  }
}

run();
