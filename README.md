# sync-lock-version

Syncs `package-lock.json`, `pnpm-lock.yaml` or `yarn.lock` versions into `package.json` file, removing dynamic numbers such as with ^, keeping static versions intact.

## Install

```bash
npm install -g sync-lock-version
```

## Usage

```
  Usage: sync-lock-version [options]

Syncs versions in lock file into package.json file

Options:
  -V, --version                  output the version number
  -d, --dir <path>               directory path where the lock file is located (default to current directory)
  -p, --dirPackageJson <path>    directory of project with target package.json, if not set, -d will be used
  -s, --save                     By default don't override the package.json file, make a new one instead package.json
  -k, --keepPrefix               By default the ^ or any other dynamic numbers are removed and replaced with static ones.
  -g, --keepGit                  By default direct git repositories are also replaced by the version written in lock file.
  -l, --keepLink                 By default direct link: repositories are also replaced by the version written in lock file.
  -a, --keepVariable <variable>  By default everything is converted to yarn version, write a part of the type you wish not to
                                 convert, seperate by comma if more than one, to not replace git and link you would use +,link:
  -h, --help                     display help for command

  Examples:
  perform inside a directory with lock file and package.json, will output package-new.json in the same directory.

```
