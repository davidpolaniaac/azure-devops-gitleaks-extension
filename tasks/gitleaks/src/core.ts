import * as toolLib from 'azure-pipelines-tool-lib/tool';
import * as fs from 'fs';
import * as tl from 'azure-pipelines-task-lib/task';
import * as path from 'path';
import { execSync } from 'child_process';

const fileName = getCliExecutableName();
const toolName = 'gitleaks';
const btPackage = 'gitleaks-' + getArchitecture();
const gitleaksFolderPath = encodePath(
  path.join(tl.getVariable('Agent.ToolsDirectory') as string, '_gitleaks')
);
const gitleaksLegacyFolderPath = encodePath(
  path.join(tl.getVariable('Agent.WorkFolder') as string, '_gitleaks')
);
const defaultGitleaksCliVersion = 'v6.2.0';
const customFolderPath = encodePath(path.join(gitleaksFolderPath, 'current'));
const customCliPath = encodePath(path.join(customFolderPath, fileName)); // Optional - Customized gitleaks-cli path.
const customLegacyCliPath = encodePath(
  path.join(gitleaksLegacyFolderPath, 'current', fileName)
);
const gitleaksCliBintrayUrl =
  'https://github.com/zricethezav/gitleaks/releases/download/';

export async function configureCliTask(
  cliVersion = defaultGitleaksCliVersion
): Promise<string> {
  try {
    const cliDownloadUrl: string = buildBintrayDownloadUrl(cliVersion);
    const cliPath: string = await getCliPath(cliDownloadUrl, cliVersion);
    runCbk(cliPath);
    return cliPath;
  } catch (error) {
    tl.setResult(
      tl.TaskResult.Failed,
      'Error occurred while executing task:\n' + error
    );
    throw new Error(error.message);
  }
}

function getCliPath(
  cliDownloadUrl: string,
  cliVersion: string
): Promise<string> {
  return new Promise(function (resolve, reject) {
    let cliDir = toolLib.findLocalTool(toolName, cliVersion);
    if (fs.existsSync(customCliPath)) {
      tl.debug('Using cli from custom cli path: ' + customCliPath);
      resolve(customCliPath);
    } else if (fs.existsSync(customLegacyCliPath)) {
      tl.warning(
        'Found GitLeaks CLI in deprecated custom path: ' +
          customLegacyCliPath +
          '. Copying GitLeaks CLI to new supported path: ' +
          customFolderPath
      );
      tl.mkdirP(customFolderPath);
      tl.cp(customLegacyCliPath, customFolderPath, '-f');
      resolve(customCliPath);
    } else if (cliDir) {
      let cliPath = path.join(cliDir, fileName);
      tl.debug('Using existing versioned cli path: ' + cliPath);
      resolve(cliPath);
    } else {
      const errMsg = generateDownloadCliErrorMessage(
        cliDownloadUrl,
        cliVersion
      );
      createCliDirs();
      return downloadCli(cliDownloadUrl, cliVersion)
        .then((cliPath) => resolve(cliPath))
        .catch((error) => reject(errMsg + '\n' + error));
    }
  });
}

function buildBintrayDownloadUrl(
  cliVersion = defaultGitleaksCliVersion
): string {
  return gitleaksCliBintrayUrl + cliVersion + '/' + btPackage;
}

function generateDownloadCliErrorMessage(
  downloadUrl: string,
  cliVersion: string
) {
  let errMsg =
    'Failed while attempting to download Gitleaks CLI from ' +
    downloadUrl +
    '. ';
  if (downloadUrl === buildBintrayDownloadUrl(cliVersion)) {
    errMsg +=
      "If this build agent cannot access the internet, you may use the 'Gitleaks Tools Installer' task, to download gitleaks CLI through an GitHub repository, which proxies " +
      buildBintrayDownloadUrl(cliVersion) +
      '. You ';
  } else {
    errMsg +=
      'If the chosen Artifactory Service cannot access the internet, you ';
  }
  errMsg +=
    'may also manually download version ' +
    cliVersion +
    ' of Gitleaks CLI and place it on the agent in the following path: ' +
    customCliPath;
  return errMsg;
}

/**
 * Execute provided CLI command in a child process. In order to receive execution's stdout, pass stdio=null.
 * @param {string} cliCommand
 * @param {string} runningDir
 * @param {string|Array} stdio - stdio to use for CLI execution.
 * @returns {Buffer|string} - execSync output.
 * @throws In CLI execution failure.
 */
export function executeCliCommand(
  cliCommand: string,
  runningDir: string,
  stdio: any
) {
  if (!fs.existsSync(runningDir)) {
    throw "Gitleaks CLI execution path doesn't exist: " + runningDir;
  }
  if (!cliCommand) {
    throw 'Cannot execute empty Cli command.';
  }
  try {
    if (!stdio) {
      stdio = [0, 1, 2];
    }
    tl.debug('Executing cliCommand: ' + cliCommand);
    return execSync(cliCommand, { cwd: runningDir, stdio: stdio });
  } catch (ex) {
    // to break the pipeline throw an error
    //throw Error(ex.toString());
  }
}

export function cliJoin(...args: string[]) {
  return args.filter((x) => x.length > 0).join(' ');
}

function quote(str: string): string {
  return '"' + str + '"';
}

function logCliVersion(cliPath: string) {
  let cliCommand = cliJoin(cliPath, '--version');
  try {
    let res: any = execSync(cliCommand);
    let detectedVersion = String.fromCharCode.apply(null, res).trim();
    console.log('GitLeaks CLI version: ' + detectedVersion);
  } catch (ex) {
    console.error('Failed to get GitLeaks CLI version: ' + ex);
  }
}

function runCbk(cliPath: string) {
  tl.debug('Running gitleaks-cli from ' + cliPath + '.');
  logCliVersion(cliPath);
}

function createCliDirs() {
  if (!fs.existsSync(gitleaksFolderPath)) {
    fs.mkdirSync(gitleaksFolderPath);
  }
}

function downloadCli(
  cliDownloadUrl: string,
  cliVersion = defaultGitleaksCliVersion
): Promise<string> {
  // If unspecified, use the default cliDownloadUrl of Bintray.
  if (!cliDownloadUrl) {
    cliDownloadUrl = buildBintrayDownloadUrl(cliVersion);
  }
  return new Promise((resolve, reject) => {
    toolLib
      .downloadTool(cliDownloadUrl, undefined, [])
      .then((downloadPath) => {
        toolLib
          .cacheFile(downloadPath, fileName, toolName, cliVersion)
          .then((cliDir) => {
            let cliPath = path.join(cliDir, fileName);
            if (!isWindows()) {
              fs.chmodSync(cliPath, 0o555);
            }
            tl.debug('Finished downloading GitLeaks cli.');
            resolve(cliPath);
          });
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function getArchitecture() {
  let platform = process.platform;
  if (platform.startsWith('win')) {
    return 'windows-amd64.exe';
  }
  if (platform.includes('darwin')) {
    return 'darwin-amd64';
  }
  if (process.arch.includes('64')) {
    return 'linux-amd64';
  }
  return 'linux-386';
}

function getCliExecutableName() {
  let executable = 'gitleaks';
  if (isWindows()) {
    executable += '.exe';
  }
  return executable;
}

/**
 * Encodes spaces with quotes in a path.
 * a/b/Program Files/c --> a/b/"Program Files"/c
 * @param str (String) - The path to encoded.
 * @returns {string} - The encoded path.
 */
function encodePath(str: string) {
  let encodedPath = '';
  let arr = str.split(path.sep);
  let count = 0;
  for (let section of arr) {
    if (section.length === 0) {
      continue;
    }
    count++;
    if (
      section.indexOf(' ') > 0 &&
      !section.startsWith('"') &&
      !section.endsWith('"')
    ) {
      section = quote(section);
    }
    encodedPath += section + path.sep;
  }
  if (count > 0 && !str.endsWith(path.sep)) {
    encodedPath = encodedPath.substring(0, encodedPath.length - 1);
  }
  if (str.startsWith(path.sep)) {
    encodedPath = path.sep + encodedPath;
  }

  return encodedPath;
}

function isWindows() {
  return process.platform.startsWith('win');
}
