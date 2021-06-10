import fs from 'fs/promises';
import { readFileSync } from 'fs';
import path from 'path';
import os from 'os';
import nock from 'nock';
import { fileURLToPath } from 'url';
import pageLoader from '../src/pageLoader.js';
import { isFileExists } from '../src/validators.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const loadFixture = (filename) => {
  const pathToFixtures = path.resolve(__dirname, '../__fixture__/', filename);
  return readFileSync(pathToFixtures, 'utf8');
};

const mockHttpResponse = (url, filename) => {
  const response = loadFixture(filename);
  const scope = nock(url)
    .get(/.*/)
    .reply(200, response);
  return scope;
};

let outputDir = '';

describe('tests on page loader', () => {
  beforeEach(async () => {
    outputDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  });

  beforeAll(() => {
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  test('should send http request and save file', async () => {
    const url = 'https://ru.hexlet.io/courses';
    const mainPageScope = mockHttpResponse(url, 'website.html');
    const expectedFileContent = loadFixture('websiteSaved.html');
    const expectedOutputFile = path.join(outputDir, 'ru-hexlet-io-courses.html');
    const expectedOutputImage = path.join(outputDir, 'ru-hexlet-io-courses_files',
      'ru-hexlet-io-assets-professions-nodejs.png');
    const imageFixture = loadFixture('nodejs.png');
    const imageScope = nock('https://ru.hexlet.io').get('/assets/professions/nodejs.png')
      .reply(200, imageFixture, {
        'content-type': 'application/octet-stream',
        'content-length': imageFixture.length,
        'content-disposition': 'attachment; filename=nodejs.png',
      });
    await pageLoader(url, outputDir);

    expect(isFileExists(expectedOutputFile)).toBeTruthy();
    const content = readFileSync(expectedOutputFile, 'utf-8');
    expect(content).toEqual(expectedFileContent);

    expect(isFileExists(expectedOutputImage)).toBeTruthy();
    const image = readFileSync(expectedOutputImage, 'utf-8');
    expect(image).toEqual(imageFixture);

    expect(imageScope.isDone()).toBeTruthy();
    expect(mainPageScope.isDone()).toBeTruthy();
  });

  test('should return error if url invalid', async () => {
    const invalidUrl = 'htp://ya.ru';
    await expect(pageLoader(invalidUrl, outputDir)).rejects.toThrowError(/Invalid url/);
  });

  test('should return error if server returns 4XX', async () => {
    const url = 'http://ya.ru';
    nock(url)
      .get('/')
      .reply(404, {});
    await expect(pageLoader(url, outputDir)).rejects.toThrowError(/Request failed/);
  });

  test("should return error if doesn't have write permissions to the output dir",
    async () => {
      const notWritablePath = '/proc';
      await expect(pageLoader('http://ya.ru/', notWritablePath)).rejects.toThrowError(/No permissions to write/);
    });
});
