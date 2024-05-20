/**
 * parser to parse lock files
 */
export interface Parser {
  // get real version fo a package
  getVersion: (pack: string, version: string, workspace?: string) => string;
}

export interface Options {
  dir?: string;
  dirPackageJson?: string;
  save?: boolean;
  keepPrefix?: boolean;
  keepGit?: boolean;
  keepLink?: boolean;
  keepVariable?: string;
}

export enum LockfileType {
  npm = "npm",
  yarn = "yarn",
  pnpm = "pnpm",
}

export interface PackageLockDep {
  version: string;
  requires?: {
    [depName: string]: string;
  };
  dependencies?: PackageLockDeps;
  dev?: boolean;
}

export interface PackageLockDeps {
  [depName: string]: PackageLockDep;
}

export interface PnpmLockDep {
  specifier: string;
  version: string;
}

export interface PnpmLockDeps {
  [workspace: string]: {
    [depName: string]: PnpmLockDep;
  };
}

export interface PackageJson {
  dependencies: {
    [dep: string]: string;
  };
  devDependencies: {
    [dep: string]: string;
  };
  workspaces?: string[] | { packages: string[] };
}
