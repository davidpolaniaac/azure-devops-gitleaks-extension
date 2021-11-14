import * as platform from './get-platform';
import * as url from './url';

import {
  createCliDirs,
  encodePath,
  generateDownloadCliErrorMessage,
  getCliExecutableName,
  isWindows,
} from './utils';

import fs from 'fs';

jest.mock('./get-platform');
jest.mock('./url');

describe('main method validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('when is wndows return true', async () => {
    //Arrange
    const mockPlatform = jest
      .spyOn(platform, 'default')
      .mockImplementation(() => 'win');
    //Act
    const actual = isWindows();
    //Assert
    expect(actual).toBeTruthy();
    expect(mockPlatform).toHaveBeenCalled();
  });

  test('when is wndows return false', async () => {
    //Arrange
    const mockPlatform = jest
      .spyOn(platform, 'default')
      .mockImplementation(() => 'linux');
    //Act
    const actual = isWindows();
    //Assert
    expect(actual).toBeFalsy();
    expect(mockPlatform).toHaveBeenCalled();
  });

  test('when is windows then getCliExecutableName return .exe', async () => {
    //Arrange
    const mockPlatform = jest
      .spyOn(platform, 'default')
      .mockImplementation(() => 'win');
    //Act
    const actual = getCliExecutableName();
    //Assert
    expect(actual).toContain('.exe');
    expect(mockPlatform).toHaveBeenCalled();
  });

  test('when is not windows then getCliExecutableName return only name', async () => {
    //Arrange
    const mockPlatform = jest
      .spyOn(platform, 'default')
      .mockImplementation(() => 'linux');
    //Act
    const actual = getCliExecutableName();
    //Assert
    expect(actual).not.toContain('.exe');
    expect(mockPlatform).toHaveBeenCalled();
  });

  test('when it is a path then Encode spaces with quotes in a path', async () => {
    //Arrange
    //Act
    const actual1 = encodePath('a/b/Program Files/c');
    const actual2 = encodePath('a a/b/c');
    const actual3 = encodePath('a/b/c');
    //Assert
    expect(actual1).toEqual('a/b/"Program Files"/c');
    expect(actual2).toEqual('"a a"/b/c');
    expect(actual3).toEqual('a/b/c');
  });

  test('when the directory does not exist then it is created', async () => {
    //Arrange
    jest.spyOn(fs, 'existsSync').mockImplementation((path) => false);
    const mockFs = jest.spyOn(fs, 'mkdirSync').mockImplementation();
    //Act
    createCliDirs('');
    //Assert
    expect(mockFs).toHaveBeenCalled();
  });

  test('when the directory exist then it is not created', async () => {
    //Arrange
    jest.spyOn(fs, 'existsSync').mockImplementation((path) => true);
    const mockFs = jest.spyOn(fs, 'mkdirSync').mockImplementation();
    //Act
    createCliDirs('');
    //Assert
    expect(mockFs).not.toHaveBeenCalled();
  });

  test('when there is an error then a message will be created', async () => {
    //Arrange
    jest.spyOn(url, 'buildBintrayDownloadUrl').mockImplementation();
    //Act
    const actual = generateDownloadCliErrorMessage('downloadUrl', 'v', 'path');
    //Assert
    expect(actual).toContain('If the chosen Artifactory Service');
  });

  test('when there is an error then a message will be created and the url is validated', async () => {
    //Arrange
    jest
      .spyOn(url, 'buildBintrayDownloadUrl')
      .mockImplementation(() => 'downloadUrl');
    //Act
    const actual = generateDownloadCliErrorMessage('downloadUrl', 'v', 'path');
    //Assert
    expect(actual).toContain('If this build agent cannot access the internet');
  });
});
