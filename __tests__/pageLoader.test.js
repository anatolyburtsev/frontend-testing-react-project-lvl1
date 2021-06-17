// import fs from 'fs/promises';
// import { readFileSync } from 'fs';
// import path from 'path';
// import os from 'os';
import nock from 'nock';
// import { fileURLToPath } from 'url';
// eslint-disable-next-line
import * as axiosdebuglog from 'axios-debug-log';
import pageLoader from '../src/index.js';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const loadFixture = (filename) => {
//   const pathToFixtures = path.resolve(__dirname, '../__fixtures__/', filename);
//   return readFileSync(pathToFixtures, 'utf8');
// };

// let outputDir = '';

// const checkFile = async (filePath, fileContent) => {
//   const content = readFileSync(filePath, 'utf-8');
//   expect(content).toEqual(fileContent);
// };

describe('tests on page loader', () => {
  // beforeEach(async () => {
  //   outputDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  // });

  beforeAll(() => {
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  test('dummy', () => {
    expect(true).toBeTruthy();
  });

  test("should return error if doesn't have write permissions to the output dir",
    async () => {
      const notWritablePath = '/p4roc';
      await expect(pageLoader('http://ya.ru/', notWritablePath)).rejects.toThrowError(/No permissions to write/);
    });
});
