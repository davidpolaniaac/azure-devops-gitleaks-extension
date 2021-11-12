import * as tl from 'azure-pipelines-task-lib/task';
import * as utils from './core';
import { scan } from './scan';

export async function run(): Promise<void> {
  try {
    const cli: string = await utils.configureCliTask();
    scan(cli);
  } catch (error) {
    tl.error(error.message);
    tl.setResult(tl.TaskResult.Failed, 'Execution error');
  }
}

run();
