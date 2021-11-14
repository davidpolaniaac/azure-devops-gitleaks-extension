import * as cli from './cli';
import * as report from './report';
import * as tl from 'azure-pipelines-task-lib/task';
import * as util from './util';

import fs from 'fs';
import { scan } from './scan';
import { when } from 'jest-when';

jest.mock('azure-pipelines-task-lib/task');
jest.mock('../src/util');
jest.mock('../src/cli');
jest.mock('../src/report');

describe('scan method validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const getVariableMock = jest
    .spyOn(tl, 'getVariable')
    .mockImplementation(() => 'temp');

  test('when there are no findings then there is no report', async () => {
    //Arrange

    const mkdirPMock = jest.spyOn(tl, 'mkdirP').mockImplementation();
    const getRulesDirectoryMock = jest
      .spyOn(util, 'getRulesDirectory')
      .mockImplementation(() => '');
    const execCliMock = jest
      .spyOn(cli, 'executeCliCommand')
      .mockImplementation();
    const cliJoinMock = jest.spyOn(cli, 'cliJoin').mockImplementation();
    const debugMock = jest.spyOn(tl, 'debug');
    //Act
    scan('/cli/path');
    //Assert
    expect(getVariableMock).toHaveBeenCalled();
    expect(mkdirPMock).toHaveBeenCalled();
    expect(getRulesDirectoryMock).toHaveBeenCalled();
    expect(execCliMock).toHaveBeenCalled();
    expect(cliJoinMock).toHaveBeenCalled();
    expect(debugMock).toHaveBeenCalledTimes(1);
  });

  test('when a finding exists then a report will be created', async () => {
    //Arrange
    const reportMock = jest.spyOn(report, 'reportHTML').mockImplementation();
    jest.spyOn(fs, 'existsSync').mockImplementation((path) => {
      return true;
    });
    const rmRFMock = jest.spyOn(tl, 'rmRF').mockImplementation(() => 'temp');

    //Act
    scan('/cli/path');
    //Assert
    expect(reportMock).toHaveBeenCalled();
    expect(rmRFMock).toHaveBeenCalled();
  });

  test('when the reason is pull request then commits are searched', async () => {
    //Arrange
    const reasonMock = jest.spyOn(tl, 'getVariable');
    when(reasonMock).calledWith('BUILD_REASON').mockReturnValue('PullRequest');
    const pullRequestMock = jest
      .spyOn(util, 'getCommitsFromPullRequest')
      .mockImplementation();

    //Act
    scan('/cli/path');
    //Assert
    expect(pullRequestMock).toHaveBeenCalled();
    expect(getVariableMock).toHaveBeenCalled();
  });

  test('when there is an error then the result the failed', async () => {
    //Arrange
    const execCliMock = jest
      .spyOn(cli, 'executeCliCommand')
      .mockImplementation(() => {
        throw new Error('error');
      });

    jest.spyOn(fs, 'existsSync').mockImplementation((path) => {
      throw new Error('error');
    });

    const setResultMock = jest.spyOn(tl, 'setResult');

    //Act
    scan('/cli/path');
    //Assert
    expect(execCliMock).toHaveBeenCalled();
    expect(setResultMock).toHaveBeenCalled();
  });
});
