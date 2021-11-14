import * as fs from 'fs';
import * as path from 'path';

import { buildBintrayDownloadUrl } from './url';
import getPlatform from './get-platform';

export function isWindows() {
  return getPlatform().startsWith('win');
}

export function getCliExecutableName() {
  let executable = 'gitleaks';
  if (isWindows()) {
    executable += '.exe';
  }
  return executable;
}

function quote(str: string): string {
  return '"' + str + '"';
}

/**
 * Encodes spaces with quotes in a path.
 * a/b/Program Files/c --> a/b/"Program Files"/c
 * @param str (String) - The path to encoded.
 * @returns {string} - The encoded path.
 */
export function encodePath(str: string) {
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

export function createCliDirs(directory: string) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }
}

export function generateDownloadCliErrorMessage(
  downloadUrl: string,
  cliVersion: string,
  customCliPath: string
) {
  let errMsg =
    'Failed while attempting to download Gitleaks CLI from ' +
    downloadUrl +
    '. ';
  if (downloadUrl === buildBintrayDownloadUrl(downloadUrl, cliVersion)) {
    errMsg +=
      "If this build agent cannot access the internet, you may use the 'Gitleaks Tools Installer' task, to download gitleaks CLI through an GitHub repository, which proxies " +
      buildBintrayDownloadUrl(downloadUrl, cliVersion) +
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
