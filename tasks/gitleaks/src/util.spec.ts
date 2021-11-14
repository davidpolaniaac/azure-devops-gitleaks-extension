import * as cli from './cli';
import * as tl from 'azure-pipelines-task-lib/task';

import {
  getCommitsFromPullRequest,
  getRulesDirectory,
  setResultMode,
} from './util';

import fs from 'fs';

jest.mock('azure-pipelines-task-lib/task');
jest.mock('../src/cli');

describe('validation of useful methods', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validation of setResultMode', () => {
    test('when mode is Info then it is successful', async () => {
      //Arrange
      const inputMock = jest
        .spyOn(tl, 'getInput')
        .mockImplementation(() => 'Info');
      const setResultMock = jest.spyOn(tl, 'setResult').mockImplementation();
      //Act
      setResultMode('');
      //Assert
      expect(inputMock).toHaveBeenCalled();
      expect(setResultMock).toHaveBeenCalledWith(tl.TaskResult.Succeeded, '');
    });
    test('when mode is Warning then it is SucceededWithIssues', async () => {
      //Arrange
      const inputMock = jest
        .spyOn(tl, 'getInput')
        .mockImplementation(() => 'Warning');
      const setResultMock = jest.spyOn(tl, 'setResult').mockImplementation();
      //Act
      setResultMode('');
      //Assert
      expect(inputMock).toHaveBeenCalled();
      expect(setResultMock).toHaveBeenCalledWith(
        tl.TaskResult.SucceededWithIssues,
        ''
      );
    });
    test('when mode is Strict then it is Failed', async () => {
      //Arrange
      const inputMock = jest
        .spyOn(tl, 'getInput')
        .mockImplementation(() => 'Strict');
      const setResultMock = jest.spyOn(tl, 'setResult').mockImplementation();
      //Act
      setResultMode('');
      //Assert
      expect(inputMock).toHaveBeenCalled();
      expect(setResultMock).toHaveBeenCalledWith(tl.TaskResult.Failed, '');
    });
  });

  describe('validation of getRulesDirectory', () => {
    test('when type is InlineRules then create localfile', async () => {
      //Arrange
      const inputMock = jest
        .spyOn(tl, 'getInput')
        .mockImplementation(() => 'InlineRules');
      const writeFileSyncMock = jest
        .spyOn(fs, 'writeFileSync')
        .mockImplementation();
      //Act
      const expected = getRulesDirectory('');
      //Assert
      expect(inputMock).toHaveBeenCalled();
      expect(writeFileSyncMock).toHaveBeenCalled();
      expect(expected).toContain('.gitscan-rules.toml');
    });
    test('when type is FilePath then it is localfile', async () => {
      //Arrange
      const inputMock = jest
        .spyOn(tl, 'getInput')
        .mockImplementation(() => 'FilePath');
      jest.spyOn(tl, 'getPathInput').mockImplementation(() => 'path');
      jest.spyOn(fs, 'existsSync').mockImplementation((path) => {
        return true;
      });
      //Act
      const expected = getRulesDirectory('');
      //Assert
      expect(inputMock).toHaveBeenCalled();
      expect('path').toEqual(expected);
    });
    test('when type is FilePath but file doesnot exist then it is default', async () => {
      //Arrange
      const inputMock = jest
        .spyOn(tl, 'getInput')
        .mockImplementation(() => 'FilePath');
      jest.spyOn(tl, 'getPathInput').mockImplementation();
      jest.spyOn(fs, 'existsSync').mockImplementation((path) => {
        return false;
      });
      //Act
      const expected = getRulesDirectory('');
      //Assert
      expect(inputMock).toHaveBeenCalled();
      expect('').toEqual(expected);
    });

    test('when type is Deafult then it is empty', async () => {
      //Arrange
      const inputMock = jest
        .spyOn(tl, 'getInput')
        .mockImplementation(() => 'Default');
      //Act
      const expected = getRulesDirectory('');
      //Assert
      expect(inputMock).toHaveBeenCalled();
      expect('').toEqual(expected);
    });
  });

  describe('validation of getCommitsFromPullRequest', () => {
    test('when it is by pull request then a file is created', async () => {
      //Arrange
      const getVariableMock = jest
        .spyOn(tl, 'getVariable')
        .mockImplementation(() => 'branch');
      const whichMock = jest.spyOn(tl, 'which').mockImplementation(() => 'git');
      const cliJoinMock = jest.spyOn(cli, 'cliJoin').mockImplementation();
      const execCliMock = jest
        .spyOn(cli, 'executeCliCommand')
        .mockImplementation();

      //Act
      const actual = getCommitsFromPullRequest('', '');
      //Assert
      expect(whichMock).toHaveBeenCalled();
      expect(cliJoinMock).toHaveBeenCalled();
      expect(execCliMock).toHaveBeenCalled();
      expect(getVariableMock).toHaveBeenCalled();
      expect(actual).toContain('.commits.log');
    });

    test('when it is by pull request and failt git then show exception', async () => {
      //Arrange
      const getVariableMock = jest
        .spyOn(tl, 'getVariable')
        .mockImplementation(() => 'branch');
      const whichMock = jest.spyOn(tl, 'which').mockImplementation(() => 'git');
      const cliJoinMock = jest.spyOn(cli, 'cliJoin').mockImplementation();
      const execCliMock = jest
        .spyOn(cli, 'executeCliCommand')
        .mockImplementation(() => {
          throw new Error('error');
        });
      //Act
      const actual = getCommitsFromPullRequest('', '');
      //Assert
      expect(whichMock).toHaveBeenCalled();
      expect(cliJoinMock).toHaveBeenCalled();
      expect(execCliMock).toHaveBeenCalled();
      expect(getVariableMock).toHaveBeenCalled();
      expect(actual).toContain('.commits.log');
    });
  });
});
