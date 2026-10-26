export interface FileChange {
  path: string;
  added: number;
  deleted: number;
}

export interface Commit {
  hash: string;
  author: string;
  date: string;
  subject: string;
  files: FileChange[];
}

export function parseGitHistory(raw: string): Commit[] {
  const commits: Commit[] = [];
  let current: Commit | undefined;

  for (const line of raw.split(/\r?\n/)) {
    // A line starting with "--" begins a new commit
    if (line.startsWith("--")) {
      const [hash, author, date, ...rest] = line.slice(2).split("|");
      current = {
        hash: hash ?? "",
        author: author ?? "",
        date: date ?? "",
        subject: rest.join("|"), // keeps any "|" the author typed in the message
        files: [],
      };
      commits.push(current);
      continue;
    }

    // Skip blank lines and anything before the first commit
    if (!current || line.trim() === "") continue;

    // Every other line looks like: added <tab> deleted <tab> path
    const [added, deleted, ...pathParts] = line.split("\t");
    const path = pathParts.join("\t");

    // Binary files like images show "-" instead of numbers, so we skip them
    if (added === "-" || deleted === "-" || path === "") continue;

    current.files.push({ path, added: Number(added), deleted: Number(deleted) });
  }

  return commits;
}