import { Options } from "./types.js";
import * as fs from "fs";

/**
 * Check if the version of Yarn's lock file is 1.
 */
export function getYarnLockfileV1(
  lockFileContents: string,
  lockFilePath?: string,
): boolean {
  if (
    lockFileContents.includes("__metadata") ||
    lockFilePath.endsWith(".yaml")
  ) {
    return false;
  } else {
    return true;
  }
}

/**
 * get the version result
 */
export const proccessVersion = (
  newVersion: string,
  currentVersion: string,
  options: Options,
) => {
  if (options.keepGit && currentVersion.includes("+")) return currentVersion;
  if (options.keepLink && currentVersion.includes("link:"))
    return currentVersion;
  if (
    options.keepVariable &&
    options.keepVariable.split(",").find(f => currentVersion.includes(f))
  )
    return currentVersion;
  if (options.keepPrefix) {
    const match = currentVersion.match(/(^[\^><=~]+)/);
    const range = match ? match[0] : "";
    return range + newVersion;
  }
  return newVersion;
};

export const readJsonFile = (jsonPath: string) => {
  const jsonText = fs.readFileSync(jsonPath, "utf8");
  const json = JSON.parse(jsonText);
  return json;
};
