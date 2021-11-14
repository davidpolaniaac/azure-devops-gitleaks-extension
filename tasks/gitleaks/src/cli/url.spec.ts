import * as platform from './get-platform';

import { buildBintrayDownloadUrl } from './url';

jest.mock('./get-platform');

describe('url validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('when the platform is darwin then the package is darwin', async () => {
    //Arrange
    const mockPlatform = jest
      .spyOn(platform, 'default')
      .mockImplementation(() => 'darwin');
    //Act
    const actual = buildBintrayDownloadUrl('baseUrl/', 'cliVersion');
    //Assert
    expect(actual).toContain('baseUrl');
    expect(actual).toContain('cliVersion');
    expect(actual).toContain('darwin-amd64');
  });

  test('when the platform is linux then the package is linux', async () => {
    //Arrange
    const mockPlatform = jest
      .spyOn(platform, 'default')
      .mockImplementation(() => 'linux');
    //Act
    const actual = buildBintrayDownloadUrl('baseUrl/', 'cliVersion');
    //Assert
    expect(actual).toContain('baseUrl');
    expect(actual).toContain('cliVersion');
    expect(actual).toContain('linux-amd64');
  });

  test('when the platform is windows then the package is windows', async () => {
    //Arrange
    const mockPlatform = jest
      .spyOn(platform, 'default')
      .mockImplementation(() => 'win');
    //Act
    const actual = buildBintrayDownloadUrl('baseUrl/', 'cliVersion');
    //Assert
    expect(actual).toContain('baseUrl');
    expect(actual).toContain('cliVersion');
    expect(actual).toContain('windows-amd64.exe');
  });
});
