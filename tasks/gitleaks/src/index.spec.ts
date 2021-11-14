import * as cli from './cli';
import * as scan from './scan';
import * as tl from 'azure-pipelines-task-lib/task';

import { run } from './index';

jest.mock('azure-pipelines-task-lib/task');
jest.mock('../src/cli');
jest.mock('../src/scan');

describe('main method validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('when the method is executed responsibilities must be delegated', async () => {
    //Arrange
    const cliMock = jest.spyOn(cli, 'configureCliTask').mockImplementation();
    const scanMock = jest.spyOn(scan, 'scan').mockImplementation();
    //Act
    await run();
    //Assert
    expect(cliMock).toHaveBeenCalled();
    expect(scanMock).toHaveBeenCalled();
  });

  test('when the method fails then the task fails', async () => {
    //Arrange

    const cliMock = jest
      .spyOn(cli, 'configureCliTask')
      .mockImplementation(() => {
        throw new Error('exception');
      });
    const setResultMock = jest.spyOn(tl, 'setResult').mockImplementation();
    //Act
    await run();
    //Assert
    expect(cliMock).toHaveBeenCalled();
    expect(setResultMock).toHaveBeenCalled();
  });
});
