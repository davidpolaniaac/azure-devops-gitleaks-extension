import * as tl from 'azure-pipelines-task-lib/task';
import * as utils from './core';
import * as path from 'path';
import * as fs from 'fs';

async function reportHTML(result: string, pathReport: string): Promise<void> {
  let file: any = fs.readFileSync(result);
  let data: any = JSON.parse(file);
  const th: string =
    'border: 1px solid #ddd; padding: 8px; padding-top: 12px; padding-bottom: 12px; text-align: left; background-color: #2b88d8; color: white;';
  const table: string =
    'font-family: Arial, Helvetica, sans-serif;border-collapse: collapse;width: 100%;';
  const td: string = 'border: 1px solid #ddd; padding: 8px;';

  const items: string[] = [];
  data.forEach((item: any) => {
    const tr = `<tr>
            <td style="${td}">${item.offender.substring(0, 3)}******</td>
            <td style="${td}">${item.rule}</td>
            <td style="${td}">${item.author}</td>
            <td style="${td}">${item.email}</td>
            <td style="${td}">${item.date}</td>
            <td style="${td}">${item.tags}</td>
            <td style="${td}">${item.file}</td>
            <td style="${td}">${item.commit}</td>
            <td style="${td}">${item.lineNumber}</td>
        </tr>`;
    items.push(tr);
  });

  const templateHtml = `<div style="padding-top: 8px;">
        <table style="${table}" width="100%">
            <tr>
                <th style="${th}">Offender</th>
                <th style="${th}">Rule</th>
                <th style="${th}">Author</th>
                <th style="${th}">Email</th>
                <th style="${th}">Date</th>
                <th style="${th}">Tags</th>
                <th style="${th}">File</th>
                <th style="${th}">Commit</th>
                <th style="${th}">Line</th>
            </tr>
            ${items.join('')}
        </table>
    </div>`;

  const report = path.join(pathReport, 'result.html');
  fs.writeFileSync(report, templateHtml);
  tl.debug(`[Scan] Uploading build summary from ${report}`);
  tl.command(
    'task.addattachment',
    {
      type: 'Distributedtask.Core.Summary',
      name: 'Git Secrets Scanning'
    },
    report
  );
}

export async function scan(cliPath: string): Promise<void> {
  let workDir = tl.getVariable('System.DefaultWorkingDirectory');
  let temp = tl.getVariable('Agent.TempDirectory');
  if (!workDir || !temp ) {
    tl.setResult(
      tl.TaskResult.Failed,
      'Failed getting default working directory.'
    );
    return;
  }
  const folderNameReport: string = '.gitscan-' + Date.now();
  const pathReport = path.join(temp, folderNameReport);
  tl.mkdirP(pathReport);
  let specPath = path.join(
    temp,
    folderNameReport,
    'gitscan-' + Date.now() + '.json'
  );
  const cliUploadCommand = `--repo-path=${workDir} --config=${__dirname}/rules.toml --report=${specPath}`;
  let cliCommand = utils.cliJoin(cliPath, cliUploadCommand);
  try {
    utils.executeCliCommand(cliCommand, workDir, null);
  } catch (executionException) {
    //Enable when active breaker
    //tl.setResult(tl.TaskResult.Failed, executionException);
    console.error('Failed executeCliCommand :' + executionException.message);
  } finally {
    // Remove created file result from file system.
    try {
      if(fs.existsSync(specPath)){
        tl.debug("Create report html");
        tl.warning("Repository leaks were detected, visit the Extensions tab to see the report");
        await reportHTML(specPath, pathReport);
      }
      tl.debug("Remove report");
      tl.rmRF(specPath);
    } catch (fileException) {
      tl.setResult(
        tl.TaskResult.Failed,
        'Failed cleaning temporary report file.'
      );
    }
  }
  // Ignored if previously failed.
  tl.setResult(tl.TaskResult.Succeeded, 'Build Succeeded.');
}

export async function run(): Promise<void> {
  try {
    const cli: string = await utils.configureCliTask();
    await scan(cli);
  } catch (error) {
    tl.error(error.message);
    tl.setResult(tl.TaskResult.Failed, 'Execution error');
  }
}

run();
