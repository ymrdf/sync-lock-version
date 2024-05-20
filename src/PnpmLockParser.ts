import { Parser, PnpmLockDeps } from "./types.js";
import { load, FAILSAFE_SCHEMA } from "js-yaml";

export class PnpmLockParser implements Parser {
  lockInfo: PnpmLockDeps;
  constructor(lockFileContents: string) {
    this.parseLockFile(lockFileContents);
  }

  public parseLockFile(lockFileContents: string): PnpmLockDeps {
    try {
      const rawLock: any = load(lockFileContents, {
        json: true,
        schema: FAILSAFE_SCHEMA,
      });
      this.lockInfo = rawLock.importers ? rawLock.importers : { ".": rawLock };
      return this.lockInfo;
    } catch (e) {
      throw new Error(
        "lock file parsing failed with " + `error ${(e as Error).message}`,
      );
    }
  }

  getVersion(pack: string, version: string, workspace: string = "."): string {
    const result =
      this.lockInfo[workspace]?.dependencies?.[pack] ||
      this.lockInfo[workspace]?.devDependencies?.[pack];
    if (result) {
      const [realVersion] = result.version.split("(");
      return realVersion;
    } else {
      throw new Error(`can not find ${pack} in lock file`);
    }
  }
}
