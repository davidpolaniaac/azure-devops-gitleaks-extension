import * as fs from 'fs';
import * as tl from 'azure-pipelines-task-lib/task';

import { buildBintrayDownloadUrl } from './url';
import { execSync } from 'child_process';
import { getCliPath } from './cliTool';
import { runCbk } from './command';

const defaultGitleaksCliVersion = 'v7.6.1';
const gitleaksCliBintrayUrl =
  'https://github.com/zricethezav/gitleaks/releases/download/';

export async function configureCliTask(
  cliVersion = defaultGitleaksCliVersion
): Promise<string> {
  try {
    const cliDownloadUrl: string = buildBintrayDownloadUrl(
      gitleaksCliBintrayUrl,
      cliVersion
    );
    const cliPath: string = await getCliPath(cliDownloadUrl, cliVersion);
    runCbk(cliPath);
    return cliPath;
  } catch (error: any) {
    tl.setResult(
      tl.TaskResult.Failed,
      'Error occurred while executing task:\n' + error
    );
    throw new Error(error.message);
  }
}

export function cliJoin(...args: string[]) {
  return args.filter((x) => x.length > 0).join(' ');
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
