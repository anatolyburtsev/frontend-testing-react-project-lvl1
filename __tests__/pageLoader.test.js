import fs from 'fs/promises';
import { readFileSync } from 'fs';
import path from 'path';
import os from 'os';
import nock from 'nock';
import _ from 'lodash';
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
const assetsInitial = Object.freeze({
  image: {
    fixturePath: 'expected/nodejs.png',
    expectedPath: 'ru-hexlet-io-assets-professions-nodejs.png',
    url: '/assets/professions/nodejs.png',
  },
  css: {
    fixturePath: 'expected/application.css',
    expectedPath: 'ru-hexlet-io-assets-application.css',
    url: '/assets/application.css',
  },
  script: {
    fixturePath: 'expected/runtime.js',
    expectedPath: 'ru-hexlet-io-packs-js-runtime.js',
    url: '/packs/js/runtime.js',
  },
  html: {
    fixturePath: 'website.html',
    expectedPath: 'ru-hexlet-io-courses.html',
    url: urlPath,
    times: 2,
  },
});
const filesDir = 'ru-hexlet-io-courses_files';

describe('page loader, positive cases', () => {
  let assets = {};
  beforeEach(async () => {
    outputDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
    assets = _.cloneDeep(assetsInitial);
    Object.entries(assets).forEach(([assetName, asset]) => {
      const fixtureContent = loadFixture(asset.fixturePath);
      const times = asset.times ? asset.times : 1;
      const scope = nock(baseUrl)
        .get(asset.url)
        .times(times)
        .reply(200, fixtureContent);
      assets[assetName].scope = scope;
      assets[assetName].fixtureContent = fixtureContent;
    });
  });
  beforeAll(() => {
    nock.disableNetConnect();
  });
  afterEach(() => {
    nock.cleanAll();
  });

  test.each(Object.keys(assetsInitial))('verify that %s saved correctly', async (assetType) => {
    const asset = assets[assetType];
    await pageLoader(url, outputDir);
    checkFile(path.join(outputDir, filesDir, asset.expectedPath), asset.fixtureContent);
    expect(asset.scope.isDone()).toBeTruthy();
  });

  test('verify that main html saved correctly', async () => {
    const response = await pageLoader(url, outputDir);
    const expectedPath = path.join(outputDir, 'ru-hexlet-io-courses.html');
    expect(response).toEqual({ filepath: expectedPath });
    const expectedContent = loadFixture('expected/website.html');
    checkFile(expectedPath, expectedContent);
  });
});

describe('page loader, negative cases', () => {
  beforeEach(async () => {
    outputDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  });

  beforeAll(() => {
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  test.each([404, 503])('should return error if server returns %d', async (httpCode) => {
    nock(baseUrl)
      .get(urlPath)
      .reply(httpCode, {});
    await expect(pageLoader(url, outputDir)).rejects.toThrowError(/Request failed/);
  });

  test('should return error if resources unavailable', async () => {
    nock(baseUrl)
      .get(urlPath)
      .reply(200, loadFixture('website.html'))
      .get(/.*/)
      .reply(500, {});
    await expect(pageLoader(url, outputDir)).rejects.toThrowError(/Failed to save/);
  });

  test("should return error if doesn't have write permissions to the output dir",
    async () => {
      const notWritablePath = '/p4roc';
      await expect(pageLoader(url, notWritablePath)).rejects.toThrowError(/No permissions to write/);
    });
});
