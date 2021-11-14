import * as tl from 'azure-pipelines-task-lib/task';

import { configureCliTask } from './cli';
import { scan } from './scan';

export async function run(): Promise<void> {
  try {
    const cli: string = await configureCliTask();
    scan(cli);
  } catch (error: any) {
    tl.error(error.message);
    tl.setResult(tl.TaskResult.Failed, 'Execution error');
  }
}

run();
