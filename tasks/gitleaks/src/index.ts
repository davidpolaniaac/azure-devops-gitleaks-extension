import { configureCliTask } from './cli';
import { scan } from './scan';
import { setResultMode } from './util';

export async function run(): Promise<void> {
  try {
    const cli: string = await configureCliTask();
    scan(cli);
  } catch (error: any) {
    setResultMode(
      'Error occurred while executing task:\n' + error.message
    );
  }
}

run();
