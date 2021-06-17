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
  const pathToFixtures = path.resolve(__dirname, '../__fixtures__/', filename);
  return readFileSync(pathToFixtures, 'utf8');
};

let outputDir = '';

// const checkFile = async (filePath, fileContent) => {
//   const content = readFileSync(filePath, 'utf-8');
//   expect(content).toEqual(fileContent);
// };

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
