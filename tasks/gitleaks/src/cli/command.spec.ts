import * as tl from 'azure-pipelines-task-lib/task';
import * as toolLib from 'azure-pipelines-tool-lib/tool';
import * as url from './url';
import * as utils from './utils';

import { downloadCli, runCbk } from './command';

import child_process from 'child_process';
import fs from 'fs';

jest.mock('azure-pipelines-task-lib/task');
jest.mock('azure-pipelines-tool-lib/tool');
jest.mock('./utils');
jest.mock('./url');

describe('command validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('when a tool is run then the version is displayed', async () => {
    //Arrange
    const debugMock = jest.spyOn(tl, 'debug').mockImplementation();
    const child_processMock = jest
      .spyOn(child_process, 'execSync')
      .mockImplementation();
    const cliPath = 'cliPath';
    const cliCommand = cliPath + ' --version';

    //Act
    runCbk(cliPath);
    //Assert
    expect(debugMock).toHaveBeenCalled();
    expect(child_processMock).toHaveBeenCalled();
    expect(child_processMock).toHaveBeenLastCalledWith(cliCommand);
  });

  test('when a tool is run and there is an error then the error is displayed', async () => {
    //Arrange
    const debugMock = jest.spyOn(tl, 'debug').mockImplementation();
    const child_processMock = jest
      .spyOn(child_process, 'execSync')
      .mockImplementation(() => {
        throw new Error('err');
      });
    const errorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

    //Act
    runCbk('');
    //Assert
    expect(debugMock).toHaveBeenCalled();
    expect(child_processMock).toHaveBeenCalled();
    expect(errorMock).toHaveBeenCalled();
  });

  test('when a tool is downloaded then the cache is validated', async () => {
    //Arrange

    jest.spyOn(toolLib, 'downloadTool').mockResolvedValue('downloadPath');
    jest.spyOn(toolLib, 'cacheFile').mockResolvedValue('cliDir');
    jest.spyOn(utils, 'isWindows').mockImplementation(() => false);
    jest.spyOn(fs, 'chmodSync').mockImplementation();

    //Act
    const actual = await downloadCli(
      'cliDownloadUrl',
      'cliVersion',
      'fileName',
      'toolName'
    );
    //Assert

    expect(actual).toContain('fileName');
    expect(actual).toContain('cliDir');
  });

  test('when the tool is on a windows platform, permissions are not validated', async () => {
    //Arrange

    jest.spyOn(toolLib, 'downloadTool').mockResolvedValue('downloadPath');
    jest.spyOn(toolLib, 'cacheFile').mockResolvedValue('cliDir');
    const mockPlatform = jest
      .spyOn(utils, 'isWindows')
      .mockImplementation(() => true);
    const mockFs = jest.spyOn(fs, 'chmodSync').mockImplementation();

    //Act
    const actual = await downloadCli(
      'cliDownloadUrl',
      'cliVersion',
      'fileName',
      'toolName'
    );
    //Assert

    expect(actual).toContain('fileName');
    expect(actual).toContain('cliDir');
    expect(mockPlatform).toHaveBeenCalled();
    expect(mockFs).not.toHaveBeenCalled();
  });

  test('when a tool is downloaded and there is an error then the error was returned', async () => {
    //Arrange
    jest.spyOn(toolLib, 'downloadTool').mockRejectedValue('custom error');
    //Act && Assert
    expect(
      downloadCli('cliDownloadUrl', 'cliVersion', 'fileName', 'toolName')
    ).rejects.toBe('custom error');
  });

  test('when the tool is downloaded then the url is validated', async () => {
    //Arrange
    jest.spyOn(toolLib, 'downloadTool').mockRejectedValue('custom error');
    const mockUrl = jest
      .spyOn(url, 'buildBintrayDownloadUrl')
      .mockImplementation();

    //Act && Assert
    expect(downloadCli('', 'cliVersion', 'fileName', 'toolName')).rejects.toBe(
      'custom error'
    );
    expect(mockUrl).toHaveBeenCalled();
  });
});
