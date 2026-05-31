import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const PACKAGE_DIR = process.cwd();
const SRC_DIR = path.join(PACKAGE_DIR, "src");
const REPO_ROOT = path.resolve(PACKAGE_DIR, "../..");

const FORBIDDEN_LITERAL_PATTERNS = [
  /^@workspace\/db(?:\/|$)/,
  /^@workspace\/api-zod(?:\/|$)/,
  /artifacts\/api-server\/src\//,
  /src\/sre_agent\//,
  /openspec\//,
  /mockup-sandbox\/src\/App(?:\.tsx)?$/,
  /mockupPreviewPlugin/,
];

const FORBIDDEN_ABSOLUTE_SEGMENTS = [
  `${path.sep}src${path.sep}sre_agent${path.sep}`,
  `${path.sep}artifacts${path.sep}api-server${path.sep}src${path.sep}`,
  `${path.sep}openspec${path.sep}`,
  `${path.sep}artifacts${path.sep}mockup-sandbox${path.sep}src${path.sep}App.tsx`,
  `${path.sep}artifacts${path.sep}mockup-sandbox${path.sep}mockupPreviewPlugin.ts`,
];

const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx"]);

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const absolutePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(absolutePath);
      continue;
    }
    if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      yield absolutePath;
    }
  }
}

function hasForbiddenLiteralImport(source) {
  return FORBIDDEN_LITERAL_PATTERNS.some((pattern) => pattern.test(source));
}

function findImports(sourceText) {
  const importRegex = /(?:import|export)\s+(?:[^"']*?from\s+)?["']([^"']+)["']/g;
  const imports = [];
  let match;
  while ((match = importRegex.exec(sourceText)) !== null) {
    imports.push(match[1]);
  }
  return imports;
}

const violations = [];

for await (const filePath of walk(SRC_DIR)) {
  const content = await readFile(filePath, "utf8");
  for (const importPath of findImports(content)) {
    if (hasForbiddenLiteralImport(importPath)) {
      violations.push({
        filePath: path.relative(PACKAGE_DIR, filePath),
        importPath,
      });
      continue;
    }

    const absoluteImportPath = resolveImportPath(filePath, importPath);
    if (absoluteImportPath && isForbiddenAbsoluteImport(absoluteImportPath)) {
      violations.push({
        filePath: path.relative(PACKAGE_DIR, filePath),
        importPath: `${importPath} -> ${path.relative(REPO_ROOT, absoluteImportPath)}`,
      });
    }
  }
}

if (violations.length > 0) {
  console.error("Boundary lint failed: found forbidden imports.");
  for (const violation of violations) {
    console.error(`- ${violation.filePath}: ${violation.importPath}`);
  }
  process.exit(1);
}

console.log("Boundary lint passed.");

function resolveImportPath(fromFile, importPath) {
  if (importPath.startsWith("@/")) {
    return path.resolve(SRC_DIR, importPath.slice(2));
  }
  if (importPath.startsWith("./") || importPath.startsWith("../")) {
    return path.resolve(path.dirname(fromFile), importPath);
  }
  return null;
}

function isForbiddenAbsoluteImport(absolutePath) {
  const normalized = absolutePath.split(path.sep).join(path.sep);
  return FORBIDDEN_ABSOLUTE_SEGMENTS.some((segment) => normalized.includes(segment));
}