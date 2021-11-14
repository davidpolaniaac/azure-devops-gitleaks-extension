import * as command from './command';
import * as tl from 'azure-pipelines-task-lib/task';
import * as toolLib from 'azure-pipelines-tool-lib/tool';
import * as utils from './utils';

import fs from 'fs';
import { getCliPath } from './cliTool';

jest.mock('azure-pipelines-task-lib/task');
jest.mock('azure-pipelines-tool-lib/tool');
jest.mock('./utils');
jest.mock('./command');

describe('clitool validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('when the cli exists then the current path will be returned', async () => {
    //Arrange
    jest.spyOn(tl, 'getVariable').mockImplementation(() => 'variable');
    jest.spyOn(utils, 'encodePath').mockImplementation(() => 'path');
    jest
      .spyOn(utils, 'getCliExecutableName')
      .mockImplementation(() => 'filename');
    jest.spyOn(toolLib, 'findLocalTool').mockReturnValue('cliDir');
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    //Act
    const actual = await getCliPath('cliDownloadUrl', 'cliVersion');
    //Assert
    expect(actual).toEqual('path');
  });

  test('when the cli does not exist then the legacy path is validated', async () => {
    //Arrange
    jest.spyOn(tl, 'getVariable').mockImplementation(() => 'variable');
    jest.spyOn(utils, 'encodePath').mockImplementation(() => 'path');
    jest
      .spyOn(utils, 'getCliExecutableName')
      .mockImplementation(() => 'filename');
    jest.spyOn(toolLib, 'findLocalTool').mockReturnValue('cliDir');
    jest
      .spyOn(fs, 'existsSync')
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
    const cpMock = jest.spyOn(tl, 'cp').mockImplementation();
    //Act
    const actual = await getCliPath('cliDownloadUrl', 'cliVersion');
    //Assert
    expect(actual).toEqual('path');
    expect(cpMock).toHaveBeenCalled();
  });

  test('when cli is already downloaded then the path is returned', async () => {
    //Arrange
    jest.spyOn(tl, 'getVariable').mockImplementation(() => 'variable');
    jest.spyOn(utils, 'encodePath').mockImplementation(() => 'path');
    jest
      .spyOn(utils, 'getCliExecutableName')
      .mockImplementation(() => 'filename');
    jest.spyOn(toolLib, 'findLocalTool').mockReturnValue('cliDir');
    jest.spyOn(fs, 'existsSync').mockReturnValue(false);
    //Act
    const actual = await getCliPath('cliDownloadUrl', 'cliVersion');
    //Assert
    expect(actual).toContain('filename');
    expect(actual).toContain('cliDir');
  });

  test('when the cli is not then it must be downloaded', async () => {
    //Arrange
    jest.spyOn(tl, 'getVariable').mockImplementation(() => 'variable');
    jest.spyOn(utils, 'encodePath').mockImplementation(() => 'path');
    jest
      .spyOn(utils, 'getCliExecutableName')
      .mockImplementation(() => 'filename');
    jest.spyOn(toolLib, 'findLocalTool').mockReturnValue('');
    jest.spyOn(fs, 'existsSync').mockReturnValue(false);
    jest.spyOn(utils, 'createCliDirs').mockImplementation();
    jest.spyOn(utils, 'generateDownloadCliErrorMessage').mockImplementation();
    const downloadMock = jest
      .spyOn(command, 'downloadCli')
      .mockResolvedValue('newCli');
    //Act
    const actual = await getCliPath('cliDownloadUrl', 'cliVersion');
    //Assert
    expect(actual).toEqual('newCli');
    expect(downloadMock).toHaveBeenCalled();
  });

  test('when it is downloaded there is an error then the error is processed', async () => {
    //Arrange
    jest.spyOn(tl, 'getVariable').mockImplementation(() => 'variable');
    jest.spyOn(utils, 'encodePath').mockImplementation(() => 'path');
    jest
      .spyOn(utils, 'getCliExecutableName')
      .mockImplementation(() => 'filename');
    jest.spyOn(toolLib, 'findLocalTool').mockReturnValue('');
    jest.spyOn(fs, 'existsSync').mockReturnValue(false);
    jest.spyOn(utils, 'createCliDirs').mockImplementation();
    jest
      .spyOn(utils, 'generateDownloadCliErrorMessage')
      .mockReturnValue('custom error');
    const downloadMock = jest
      .spyOn(command, 'downloadCli')
      .mockRejectedValue('reject');
    //Act && Assert
    expect(getCliPath('cliDownloadUrl', 'cliVersion')).rejects.toContain(
      'reject'
    );
    expect(getCliPath('cliDownloadUrl', 'cliVersion')).rejects.toContain(
      'custom error'
    );
    expect(downloadMock).toHaveBeenCalled();
  });
});
