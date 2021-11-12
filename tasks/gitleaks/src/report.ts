import * as fs from 'fs';
import * as path from 'path';
import * as tl from 'azure-pipelines-task-lib/task';

export function reportHTML(scanDirectory: string, reportFile: string): void {
  const file: any = fs.readFileSync(reportFile);
  const data: any = JSON.parse(file);
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

  const report = path.join(scanDirectory, 'report.html');
  fs.writeFileSync(report, templateHtml, { encoding: 'utf8', flag: 'w' });
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
