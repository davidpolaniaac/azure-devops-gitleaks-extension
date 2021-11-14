import * as cliTool from './cliTool';
import * as command from './command';
import * as tl from 'azure-pipelines-task-lib/task';
import * as url from './url';

import { cliJoin, configureCliTask, executeCliCommand } from './index';

import child_process from 'child_process';
import fs from 'fs';

jest.mock('azure-pipelines-task-lib/task');
jest.mock('./url');
jest.mock('./command');
jest.mock('./cliTool');

describe('cli validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('when the cli is used then the arguments are joined', async () => {
    //Arragnge
    //Act
    const actual = cliJoin('test', '1', '2');
    //Assert
    expect(actual).toEqual('test 1 2');
  });

  test('when the cli is used then the arguments are joined', async () => {
    //Arragnge
    const urlMock = jest
      .spyOn(url, 'buildBintrayDownloadUrl')
      .mockImplementation();
    const cliPath = jest.spyOn(cliTool, 'getCliPath').mockResolvedValue('test');
    const commandMock = jest.spyOn(command, 'runCbk').mockImplementation();
    //Act
    const actual = await configureCliTask();
    //Assert
    expect(actual).toEqual('test');
    expect(urlMock).toHaveBeenCalled();
    expect(cliPath).toHaveBeenCalled();
    expect(commandMock).toHaveBeenCalled();
  });

  test('when the cli is used and there is an error then the error is processed', async () => {
    //Arragnge
    const urlMock = jest
      .spyOn(url, 'buildBintrayDownloadUrl')
      .mockImplementation();
    const cliPath = jest.spyOn(cliTool, 'getCliPath').mockImplementation(() => {
      throw new Error('test');
    });
    const resultMock = jest.spyOn(tl, 'setResult').mockImplementation();
    //Act && Assert
    expect(configureCliTask()).rejects.toThrow('test');
    expect(urlMock).toHaveBeenCalled();
    expect(cliPath).toHaveBeenCalled();
    expect(resultMock).toHaveBeenCalled();
  });

  test('when a cli is run then directory is validated and the cli', async () => {
    //Arragnge
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    const execMock = jest.spyOn(child_process, 'execSync').mockImplementation();
    //Act
    executeCliCommand('cliCommand', 'runningDir', undefined);
    //Assert
    expect(execMock).toHaveBeenCalled();
  });

  test('when the directory is empty then it throws an error', async () => {
    //Arragnge
    jest.spyOn(fs, 'existsSync').mockReturnValue(false);
    const execMock = jest.spyOn(child_process, 'execSync').mockImplementation();
    //Act && Assert
    expect(() => executeCliCommand('cliCommand', '', undefined)).toThrow();
    expect(execMock).not.toHaveBeenCalled();
  });

  test('when the cli is empty then it throws an error', async () => {
    //Arragnge
    jest.spyOn(fs, 'existsSync').mockReturnValue(false);
    const execMock = jest.spyOn(child_process, 'execSync').mockImplementation();
    //Act && Assert
    expect(() => executeCliCommand('', 'runningDir', undefined)).toThrow();
    expect(execMock).not.toHaveBeenCalled();
  });
});
