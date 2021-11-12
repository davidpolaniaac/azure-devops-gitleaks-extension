import * as tl from 'azure-pipelines-task-lib/task';
import * as path from 'path';
import * as fs from 'fs';
import * as utils from './core';
import { reportHTML } from './report';
import { getCommitsFromPullRequest, getMode, getRulesDirectory } from './util';

export function scan(cliPath: string): void {
  const workDir: string = tl.getVariable(
    'System.DefaultWorkingDirectory'
  ) as string;
  const temp: string = tl.getVariable('Agent.TempDirectory') as string;
  const reason: string = tl.getVariable('BUILD_REASON') as string;

  const folder: string = '.gitscan-' + Date.now();
  const scanDirectory = path.join(temp, folder);
  const report = path.join(scanDirectory, '.gitscan-' + Date.now() + '.json');

  tl.mkdirP(scanDirectory);

  const rulesDirectory: string = getRulesDirectory(scanDirectory);
  let cliArguments = `--path=${workDir} --config-path=${rulesDirectory} --report=${report}`;

  console.log('Reason:', reason);
  if (reason === 'PullRequest') {
    console.log('All commits in PullRequest');
    const commits = getCommitsFromPullRequest(scanDirectory, workDir);
    cliArguments += ` --commits-file=${commits}`;
  } else {
    console.log('All commits in Branch');
  }

  const cliCommand = utils.cliJoin(cliPath, cliArguments);

  try {
    utils.executeCliCommand(cliCommand, workDir, null);
  } catch (executionException) {
    console.error('Failed executeCliCommand :' + executionException.message);
    tl.setResult(getMode(), 'with runtime errors');
  } finally {
    // Remove created file result from file system.
    try {
      if (fs.existsSync(report)) {
        tl.debug('Create report html');
        reportHTML(scanDirectory, report);
        tl.setResult(
          getMode(),
          'Repository leaks were detected, visit the Extensions tab to see the report'
        );
        tl.debug('Remove report');
        tl.rmRF(report);
      } else {
        tl.debug('No leaks were detected in the repository');
      }
    } catch (fileException) {
      tl.setResult(
        tl.TaskResult.Failed,
        'Failed cleaning temporary report file.'
      );
    }
  }
}
