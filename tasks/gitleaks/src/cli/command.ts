import * as fs from 'fs';
import * as path from 'path';
import * as tl from 'azure-pipelines-task-lib/task';
import * as toolLib from 'azure-pipelines-tool-lib/tool';

import { buildBintrayDownloadUrl } from './url';
import { execSync } from 'child_process';
import { isWindows } from './utils';

function logCliVersion(cliPath: string) {
  let cliCommand = cliPath + ' --version';
  try {
    let res: any = execSync(cliCommand);
    let detectedVersion = String.fromCharCode.apply(null, res).trim();
    console.log('GitLeaks CLI version: ' + detectedVersion);
  } catch (ex) {
    console.error('Failed to get GitLeaks CLI version: ' + ex);
  }
}

export function runCbk(cliPath: string): void {
  tl.debug('Running gitleaks-cli from ' + cliPath + '.');
  logCliVersion(cliPath);
}

export function downloadCli(
  cliDownloadUrl: string,
  cliVersion: string,
  fileName: string,
  toolName: string
): Promise<string> {
  // If unspecified, use the default cliDownloadUrl of Bintray.
  if (!cliDownloadUrl) {
    cliDownloadUrl = buildBintrayDownloadUrl(cliDownloadUrl, cliVersion);
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
