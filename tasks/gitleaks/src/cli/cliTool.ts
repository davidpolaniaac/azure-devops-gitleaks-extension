import * as fs from 'fs';
import * as path from 'path';
import * as tl from 'azure-pipelines-task-lib/task';
import * as toolLib from 'azure-pipelines-tool-lib/tool';

import {
  createCliDirs,
  encodePath,
  generateDownloadCliErrorMessage,
  getCliExecutableName,
} from './utils';

import { downloadCli } from './command';

export function getCliPath(
  cliDownloadUrl: string,
  cliVersion: string
): Promise<string> {
  const toolName = 'gitleaks';
  const gitleaksFolderPath = encodePath(
    path.join(tl.getVariable('Agent.ToolsDirectory') as string, '_gitleaks')
  );
  const fileName = getCliExecutableName();
  const customFolderPath = encodePath(path.join(gitleaksFolderPath, 'current'));
  const customCliPath = encodePath(path.join(customFolderPath, fileName));

  const gitleaksLegacyFolderPath = encodePath(
    path.join(tl.getVariable('Agent.WorkFolder') as string, '_gitleaks')
  );
  const customLegacyCliPath = encodePath(
    path.join(gitleaksLegacyFolderPath, 'current', fileName)
  );

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
        cliVersion,
        customCliPath
      );
      createCliDirs(gitleaksFolderPath);
      return downloadCli(cliDownloadUrl, cliVersion, fileName, toolName)
        .then((cliPath) => resolve(cliPath))
        .catch((error) => reject(errMsg + '\n' + error));
    }
  });
}
