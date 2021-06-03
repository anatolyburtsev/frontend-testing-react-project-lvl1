import getFileNameFromUrl from '../src/utils.js';

describe('test utils', () => {
  test('should create filename based on url', () => {
    const url = 'https://ru.hexlet.io/courses';
    const expectedFileName = 'ru-hexlet-io-courses.html';
    const filename = getFileNameFromUrl(url);
    expect(filename).toEqual(expectedFileName);
  });
});
