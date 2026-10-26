const IGNORED_DIRS = [
  "node_modules",
  "dist",
  "build",
  "vendor",
  ".git",
  "coverage",
  ".github",
  "docs",
];

const IGNORED_NAMES = new Set([
  "pnpm-lock.yaml",
  "package-lock.json",
  "bun.lockb",
  "Cargo.lock",
  "poetry.lock",
  "composer.lock",
  "Gemfile.lock",
  "go.sum",
  "LICENSE",
  "LICENCE",
  "NOTICE",
  "package.json",
]);

const IGNORED_EXTENSIONS =
  /\.(png|jpe?g|gif|svg|ico|webp|pdf|zip|gz|woff2?|ttf|eot|mp4|mp3|map|lock|md|mdx|txt|rst|adoc)$|\.min\.(js|css)$/i;

// Decides whether a file counts as source code worth analyzing
export function shouldAnalyzeFile(path: string): boolean {
  const parts = path.split("/");
  const name = parts[parts.length - 1] ?? "";
  const folders = parts.slice(0, -1);

  if (folders.some((folder) => IGNORED_DIRS.includes(folder))) return false;
  if (IGNORED_NAMES.has(name)) return false;
  return !IGNORED_EXTENSIONS.test(name);
}