import { spawn } from "node:child_process";

// Runs git with a list of arguments and returns what it printed.
// Arguments are passed as a list, never joined into one string, so a
// malicious URL can't sneak extra commands in.
export function runGit(args: string[], cwd?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn("git", args, { cwd });
    const out: Buffer[] = [];
    const err: Buffer[] = [];

    child.stdout.on("data", (chunk: Buffer) => out.push(chunk));
    child.stderr.on("data", (chunk: Buffer) => err.push(chunk));
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve(Buffer.concat(out).toString("utf8"));
      } else {
        reject(new Error(`git ${args[0]} failed: ${Buffer.concat(err).toString("utf8")}`));
      }
    });
  });
}