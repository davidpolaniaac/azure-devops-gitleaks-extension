import * as tl from 'azure-pipelines-task-lib/task';

import fs from 'fs';
import { reportHTML } from './report';

jest.mock('azure-pipelines-task-lib/task');

describe('report method validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('when elements exist then a template is created', async () => {
    //Arrange
    const writeFileSyncMock = jest
      .spyOn(fs, 'writeFileSync')
      .mockImplementation();
    const readFileSyncMock = jest
      .spyOn(fs, 'readFileSync')
      .mockImplementation(() => '[{"offender": "1234567"}]');
    const commandMock = jest.spyOn(tl, 'command').mockImplementation();
    //Act
    reportHTML('', '');
    //Assert
    expect(writeFileSyncMock).toHaveBeenCalled();
    expect(readFileSyncMock).toHaveBeenCalled();
    expect(commandMock).toHaveBeenCalled();
  });
});
