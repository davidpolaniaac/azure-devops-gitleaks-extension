import * as fs from 'fs';
import * as path from 'path';
import * as tl from 'azure-pipelines-task-lib/task';

import { cliJoin, executeCliCommand } from './cli';
import {
  getCommitsFromPullRequest,
  getRulesDirectory,
  setResultMode,
} from './util';

import { reportHTML } from './report';

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

  const cliCommand = cliJoin(cliPath, cliArguments);

  try {
    executeCliCommand(cliCommand, workDir, null);
  } catch (error: any) {
    console.error('Failed executeCliCommand :' + error.message);
    setResultMode('with runtime errors');
  } finally {
    // Remove created file result from file system.
    try {
      if (fs.existsSync(report)) {
        tl.debug('Create report html');
        reportHTML(scanDirectory, report);
        setResultMode(
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
