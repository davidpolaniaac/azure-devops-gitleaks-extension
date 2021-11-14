import getPlatform from './get-platform';

describe('platform validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('when the platform is queried then return a string', async () => {
    //Act
    const actual = getPlatform();
    //Assert
    expect(actual).toBeDefined();
    expect(actual).not.toBeUndefined();
  });
});
