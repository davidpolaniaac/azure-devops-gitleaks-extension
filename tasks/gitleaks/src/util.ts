import * as tl from 'azure-pipelines-task-lib/task';
import * as path from 'path';
import * as fs from 'fs';
import * as utils from './core';

export function getMode(): tl.TaskResult {
  const mode = tl.getInput('mode', true);
  let modeExecution = tl.TaskResult.Succeeded;
  switch (mode) {
    case 'Warning':
      modeExecution = tl.TaskResult.SucceededWithIssues;
      break;
    case 'Strict':
      modeExecution = tl.TaskResult.Failed;
      break;
    default:
      tl.debug('Default mode is infromative');
      break;
  }

  return modeExecution;
}

export function getRulesDirectory(scanDirectory: string): string {
  const type = tl.getInput('type');
  let rulesPath: string = '';

  if (type === 'InlineRules') {
    const rules = tl.getInput('rules', true);
    rulesPath = path.join(scanDirectory, '.gitscan-rules.toml');
    fs.writeFileSync(rulesPath, rules, { encoding: 'utf8', flag: 'w' });
  } else if (type === 'FilePath') {
    const rulesFile = tl.getPathInput('rulesFile', true) as string;
    if (fs.existsSync(rulesFile)) {
      rulesPath = rulesFile;
    } else {
      tl.warning('the rules file was not found, the default rules are used');
    }
  } else {
    tl.debug('using default rules');
  }

  return rulesPath;
}

export function getCommitsFromPullRequest(
  scanDirectory: string,
  workDir: string
): string {
  const sourceBranch: string = tl.getVariable(
    'SYSTEM_PULLREQUEST_SOURCEBRANCH'
  ) as string;
  const targetBranch: string = tl.getVariable(
    'SYSTEM_PULLREQUEST_TARGETBRANCH'
  ) as string;

  const source: string = sourceBranch.replace(
    /(^refs\/heads\/)/gi,
    'remotes/origin/'
  );
  const target: string = targetBranch.replace(
    /(^refs\/heads\/)/gi,
    'remotes/origin/'
  );

  const commitsPath = path.join(scanDirectory, '.commits.log');
  const gitPath = tl.which('git', true);
  const cliArguments = `rev-list ${source}...${target} > ${commitsPath}`;
  const cliCommand = utils.cliJoin(gitPath, cliArguments);

  try {
    utils.executeCliCommand(cliCommand, workDir, null);
  } catch (error) {
    console.error('Failed executeCliCommand :' + error.message);
  }

  return commitsPath;
}
