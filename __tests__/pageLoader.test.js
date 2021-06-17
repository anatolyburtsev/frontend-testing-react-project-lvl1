import fs from 'fs/promises';
import { readFileSync } from 'fs';
import path from 'path';
import os from 'os';
import nock from 'nock';
// import { fileURLToPath } from 'url';
// eslint-disable-next-line
import * as axiosdebuglog from 'axios-debug-log';
import pageLoader from '../src/index.js';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const loadFixture = (filename) => {
  const pathToFixtures = path.resolve(__dirname, '../__fixture__/', filename);
  return readFileSync(pathToFixtures, 'utf8');
};

let outputDir = '';

const checkFile = async (filePath, fileContent) => {
  const content = readFileSync(filePath, 'utf-8');
  expect(content).toEqual(fileContent);
};

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
    const filesDir = 'ru-hexlet-io-courses_files';
    const expectedHTMLFilePath = path.join(outputDir, 'ru-hexlet-io-courses.html');
    const expectedHTMLFileContent = loadFixture('websiteSaved.html');
    const expectedImagePath = path.join(outputDir, filesDir,
      'ru-hexlet-io-assets-professions-nodejs.png');
    const expectedImageContent = loadFixture('nodejs.png');
    const expectedCssPath = path.join(outputDir, filesDir,
      'ru-hexlet-io-assets-application.css');
    const expectedCssContent = loadFixture('application.css');
    const expectedScriptPath = path.join(outputDir, filesDir,
      'ru-hexlet-io-packs-js-runtime.js');
    const expectedScriptContent = loadFixture('runtime.js');
    const expectedHTMLLinkFilePath = path.join(outputDir, filesDir,
      'ru-hexlet-io-courses.html');
    const expectedHTMLLinkContent = loadFixture('website.html');

    const baseUrl = 'https://ru.hexlet.io';
    const url = 'https://ru.hexlet.io/courses';

    const mainHTMLScope = nock(baseUrl)
      .get('/courses')
      .twice()
      .reply(200, loadFixture('website.html'));
    const imageScope = nock(baseUrl).get('/assets/professions/nodejs.png')
      .reply(200, expectedImageContent, {
        'content-type': 'application/octet-stream',
        'content-length': expectedImageContent.length,
        'content-disposition': 'attachment; filename=nodejs.png',
      });
    const cssScope = nock(baseUrl).get('/assets/application.css')
      .reply(200, expectedCssContent);
    const scriptScope = nock(baseUrl).get('/packs/js/runtime.js')
      .reply(200, expectedScriptContent);

    const { filepath } = await pageLoader(url, outputDir);

    expect(filepath).toEqual(expectedHTMLFilePath);

    await checkFile(expectedHTMLFilePath, expectedHTMLFileContent);
    await checkFile(expectedImagePath, expectedImageContent);
    await checkFile(expectedCssPath, expectedCssContent);
    await checkFile(expectedScriptPath, expectedScriptContent);
    await checkFile(expectedHTMLLinkFilePath, expectedHTMLLinkContent);

    expect(imageScope.isDone()).toBeTruthy();
    expect(mainHTMLScope.isDone()).toBeTruthy();
    expect(cssScope.isDone()).toBeTruthy();
    expect(scriptScope.isDone()).toBeTruthy();
  });

  test('should return error if url is unavailable', async () => {
    const baseUrl = 'https://ru.hexlet.io';
    const url = 'https://ru.hexlet.io/courses';
    const expectedScriptContent = loadFixture('runtime.js');
    const expectedImageContent = loadFixture('nodejs.png');

    nock(baseUrl)
      .get('/courses')
      .twice()
      .reply(200, loadFixture('website.html'));
    nock(baseUrl).get('/assets/professions/nodejs.png')
      .reply(200, expectedImageContent, {
        'content-type': 'application/octet-stream',
        'content-length': expectedImageContent.length,
        'content-disposition': 'attachment; filename=nodejs.png',
      });
    nock(baseUrl).get('/packs/js/runtime.js')
      .reply(200, expectedScriptContent);
    nock(baseUrl).get('/assets/application.css')
      .reply(500, {});

    await expect(pageLoader(url, outputDir)).rejects
      .toThrowError();
    // .toThrowError(/Failed to download several resources: ru-hexlet-io-assets-application.css/);
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
      const notWritablePath = '/p4roc';
      await expect(pageLoader('http://ya.ru/', notWritablePath)).rejects.toThrowError(/No permissions to write/);
    });
});
