#!/usr/bin/env node
"use strict";
import * as fs from "fs";
import * as path from "path";
import glob from "glob";
import * as wjf from "write-json-file";
import { Command } from "commander";
import { getYarnLockfileV1, readJsonFile } from "./utils.js";
import { Parser, PackageJson, LockfileType } from "./types.js";
import chalk from "chalk";
import { NpmLockParser } from "./NpmLockParser.js";
import { YarnLockParser } from "./YarnLockParser.js";
import { PnpmLockParser } from "./PnpmLockParser.js";
import { lockfileNameList } from "./constants.js";

const program = new Command();

program
  .version("0.0.1")
  .description("Syncs versions in lock file into package.json file")
  .option(
    "-d, --dir <path>",
    "directory path where the lock file is located (default to current directory)",
  )
  .option(
    "-p, --dirPackageJson <path>",
    "directory of project with target package.json, if not set, -d will be used",
  )
  .option(
    "-s, --save",
    "By default don't override the package.json file, make a new one instead package.json ",
  )
  .option(
    "-k, --keepPrefix",
    "By default the ^ or any other dynamic numbers are removed and replaced with static ones.",
  )
  .option(
    "-g, --keepGit",
    "By default direct git repositories are also replaced by the version written in lock file.",
  )
  .option(
    "-l, --keepLink",
    "By default direct link: repositories are also replaced by the version written in lock file.",
  )
  .option(
    "-a, --keepVariable <variable>",
    "By default everything is converted to yarn version, write a part of the type you wish not to convert, seperate by comma if more than one, to not replace git and link you would use +,link:",
  )
  .parse(process.argv);

const options = program.opts();

function updatePackage(packageDir: string, parser: Parser, workspace?: string) {
  const jsonPath = path.resolve(packageDir, "package.json");
  if (!fs.existsSync(jsonPath)) return;
  const packageJson = readJsonFile(jsonPath) as PackageJson;
  const saveTo = path.resolve(
    path.dirname(jsonPath),
    options.save ? "package.json" : "package-new.json",
  );

  for (const [dep, value] of Object.entries(packageJson.dependencies)) {
    packageJson.dependencies[dep] = parser.getVersion(dep, value, workspace);
  }

  for (const [dep, value] of Object.entries(
    packageJson.devDependencies || {},
  )) {
    packageJson.devDependencies[dep] = parser.getVersion(dep, value, workspace);
  }

  wjf.writeJsonFile(saveTo, packageJson);

  console.log(`${chalk.green("SUCCESS:")}, sync ${chalk.green(saveTo)}`);

  if (packageJson.workspaces) {
    const packagePaths = Array.isArray(packageJson.workspaces)
      ? packageJson.workspaces
      : packageJson.workspaces.packages;

    if (Array.isArray(packagePaths)) {
      packagePaths.forEach((packagePath: string) => {
        const packages = glob.sync(
          path.resolve(
            packageDir,
            `${packagePath}${packagePath.endsWith("/") ? "" : "/"}`,
          ),
          { absolute: true },
        );
        packages.forEach(workspaceDir => {
          updatePackage(
            workspaceDir,
            parser,
            workspaceDir.slice(packageDir.length + 1),
          );
        });
      });
    }
  }
}

const getParser = (dir: string): Parser => {
  let lockfileContent = "";
  let lockfileType: LockfileType | null = null;
  let lockfile = "";

  for (let { type, fileName } of lockfileNameList) {
    const filePath = path.resolve(dir, fileName);
    if (fs.existsSync(filePath)) {
      lockfileContent = fs.readFileSync(filePath, "utf8");
      console.log(
        `find lockfile:${chalk.green(fileName)}, lockfile type: ${chalk.green(
          type,
        )}`,
      );
      lockfileType = type;
      lockfile = filePath;
      break;
    }
  }

  if (!lockfileType || !lockfileContent) {
    throw new Error(
      "[sync-lock-version]can not find lockfile, please double check you work directory",
    );
  }
  let parser: Parser | null = null;
  switch (lockfileType) {
    case LockfileType.npm:
      parser = new NpmLockParser(lockfileContent);
      break;
    case LockfileType.pnpm:
      parser = new PnpmLockParser(lockfileContent);
      break;
    case LockfileType.yarn:
      parser = new YarnLockParser(
        lockfileContent,
        getYarnLockfileV1(lockfileContent, lockfile),
      );
  }

  return parser;
};

const dir = options.dir ? options.dir : process.cwd();
const packageDir = options.dirPackageJson ? options.dirPackageJson : dir;

updatePackage(packageDir, getParser(dir));
