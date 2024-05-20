import { Parser, PackageLockDeps } from "./types.js";

export class NpmLockParser implements Parser {
  lockInfo: PackageLockDeps;
  constructor(lockFileContents: string) {
    this.parseLockFile(lockFileContents);
  }

  public parseLockFile(lockFileContents: string): PackageLockDeps {
    try {
      const packageLock: { packages: PackageLockDeps } =
        JSON.parse(lockFileContents);
      this.lockInfo = packageLock.packages;
      return packageLock.packages;
    } catch (e) {
      throw new Error(
        "package-lock.json parsing failed with " +
          `error ${(e as Error).message}`,
      );
    }
  }

  getVersion(pack: string, version: string, workspace?: string): string {
    if (workspace && this.lockInfo[`${workspace}/node_modules/${pack}`]) {
      return this.lockInfo[`${workspace}/node_modules/${pack}`].version;
    }
    const result = this.lockInfo[`node_modules/${pack}`]?.version;
    if (result) {
      return result;
    } else {
      throw new Error(`can not find ${pack} in lock file`);
    }
  }
}
