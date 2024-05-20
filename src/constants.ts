import { LockfileType } from "./types.js";

export const lockfileNameList = [
  {
    type: LockfileType.npm,
    fileName: "package-lock.json",
  },
  {
    type: LockfileType.pnpm,
    fileName: "pnpm-lock.yaml",
  },
  {
    type: LockfileType.yarn,
    fileName: "yarn.lock",
  },
  {
    type: LockfileType.yarn,
    fileName: ".yarnrc.yml",
  },
];
