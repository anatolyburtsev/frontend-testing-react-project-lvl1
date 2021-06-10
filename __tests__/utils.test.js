import { getFileNameFromUrl, getFileNameFromUrlWithExtension } from '../src/utils.js';

const testUrl = 'https://ru.hexlet.io/courses';
const testUrlWithExt = 'https://ru.hexlet.io/assets/professions/nodejs.png';

describe('test utils', () => {
  test.each([[testUrl, new URL(testUrl)]])('should create filename based on url string', (url) => {
    const expectedFileName = 'ru-hexlet-io-courses.html';
    const filename = getFileNameFromUrl(url, '.html');
    expect(filename).toEqual(expectedFileName);
  });

  test.each([[testUrlWithExt, new URL(testUrlWithExt)]])('should create filename based on url with Extension', (url) => {
    const expectedFileName = 'ru-hexlet-io-assets-professions-nodejs.png';
    const filename = getFileNameFromUrlWithExtension(url);
    expect(filename).toEqual(expectedFileName);
  });

  test('should throw an error if url has several dots', () => {
    const url = `${testUrlWithExt}.extra`;
    expect(() => getFileNameFromUrlWithExtension(url))
      .toThrowError(/expected URL with path with 1 dot/);
  });
});
