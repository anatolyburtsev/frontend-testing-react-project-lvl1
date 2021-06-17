import fs from 'fs/promises';
import { readFileSync } from 'fs';
import path from 'path';
import os from 'os';
import nock from 'nock';
// eslint-disable-next-line
import * as axiosdebuglog from 'axios-debug-log';
import pageLoader from '../src/index.js';

const loadFixture = (filename) => {
  const pathToFixtures = path.resolve(__dirname, '../__fixtures__/', filename);
  return readFileSync(pathToFixtures, 'utf8');
};

const checkFile = (filePath, fileContent) => {
  const content = readFileSync(filePath, 'utf-8');
  expect(content).toEqual(fileContent);
};

let outputDir = '';
const baseUrl = 'https://ru.hexlet.io';
const urlPath = '/courses';
const url = `${baseUrl}${urlPath}`;

describe('tests on page loader, positive', () => {
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
    const expectedHTMLFileContent = loadFixture('websiteExpected.html');
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

    const mainHTMLScope = nock(baseUrl)
      .get(urlPath)
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

    checkFile(expectedHTMLFilePath, expectedHTMLFileContent);
    checkFile(expectedImagePath, expectedImageContent);
    checkFile(expectedCssPath, expectedCssContent);
    checkFile(expectedScriptPath, expectedScriptContent);
    checkFile(expectedHTMLLinkFilePath, expectedHTMLLinkContent);

    expect(imageScope.isDone()).toBeTruthy();
    expect(mainHTMLScope.isDone()).toBeTruthy();
    expect(cssScope.isDone()).toBeTruthy();
    expect(scriptScope.isDone()).toBeTruthy();
  });
});

describe('tests on page loader, negative cases', () => {
  beforeEach(async () => {
    outputDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  });

  beforeAll(() => {
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  test('should return error if url is unavailable', async () => {
    const expectedScriptContent = loadFixture('runtime.js');
    const expectedImageContent = loadFixture('nodejs.png');

    nock(baseUrl)
      .get(urlPath)
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
      .toThrowError(/Failed to download several resources: ru-hexlet-io-assets-application.css/);
  });

  test.skip('should return error if url invalid', async () => {
    const invalidUrl = 'htp://ya.ru';
    await expect(pageLoader(invalidUrl, outputDir)).rejects.toThrowError(/Invalid url/);
  });

  test('should return error if server returns 4XX', async () => {
    nock(baseUrl)
      .get(urlPath)
      .reply(404, {});
    await expect(pageLoader(url, outputDir)).rejects.toThrowError(/Request failed/);
  });

  test("should return error if doesn't have write permissions to the output dir",
    async () => {
      const notWritablePath = '/p4roc';
      await expect(pageLoader(url, notWritablePath)).rejects.toThrowError(/No permissions to write/);
    });
});
