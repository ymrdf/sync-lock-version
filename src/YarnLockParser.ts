import { Parser, PackageLockDeps } from "./types.js";
import yarnLockfileParser from "@yarnpkg/lockfile";
import yarnCore from "@yarnpkg/core";
import { load, FAILSAFE_SCHEMA } from "js-yaml";

const MULTIPLE_KEYS_REGEXP = / *, */g;

export class YarnLockParser implements Parser {
  lockInfo: PackageLockDeps;
  constructor(lockFileContents: string, isYarnV1: boolean) {
    if (isYarnV1) {
      this.parseYarnV1LockFile(lockFileContents);
    } else {
      this.parseYarnV2LockFile(lockFileContents);
    }
  }

  public parseYarnV1LockFile(lockFileContents: string): PackageLockDeps {
    try {
      const yarnLock = yarnLockfileParser.parse(lockFileContents);
      this.lockInfo = yarnLock.object;
      return this.lockInfo;
    } catch (e) {
      throw new Error(
        "lock file parsing failed with " + `error ${(e as Error).message}`,
      );
    }
  }

  public parseYarnV2LockFile(lockFileContents: string): PackageLockDeps {
    try {
      const rawYarnLock: any = load(lockFileContents, {
        json: true,
        schema: FAILSAFE_SCHEMA,
      });

      const dependencies = {};
      Object.entries(rawYarnLock).forEach(
        ([fullDescriptor, versionData]: [string, any]) => {
          fullDescriptor.split(MULTIPLE_KEYS_REGEXP).forEach(item => {
            const descriptor = yarnCore.structUtils.parseDescriptor(item);
            const range = yarnCore.structUtils.parseRange(descriptor.range);
            dependencies[`${descriptor.name}@${range.selector}`] = versionData;
          });
        },
      );
      this.lockInfo = dependencies;
      return this.lockInfo;
    } catch (e) {
      throw new Error(
        "lock file parsing failed with " + `error ${(e as Error).message}`,
      );
    }
  }

  getVersion(pack: string, version: string, workspace?: string): string {
    const result = this.lockInfo[`${pack}@${version}`];
    if (result) {
      return result.version;
    } else {
      throw new Error(`can not find ${pack} in lock file`);
    }
  }
}
