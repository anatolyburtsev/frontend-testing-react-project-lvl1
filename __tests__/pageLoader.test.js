import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import nock from 'nock';
import pageLoader from '../src/index.js';

const loadFixture = (filename) => {
  const pathToFixtures = path.resolve(__dirname, '../__fixtures__/', filename);
  return fs.readFile(pathToFixtures, 'utf8');
};

let outputDir = '';
const baseUrl = 'https://ru.hexlet.io';
const urlPath = '/courses';
const url = `${baseUrl}${urlPath}`;
let assets;

const filesDir = 'ru-hexlet-io-courses_files';

nock.disableNetConnect();

afterEach(() => {
  nock.cleanAll();
});

beforeEach(async () => {
  outputDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  assets = Object.freeze({
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
    },
    link: {
      fixturePath: 'website.html',
      expectedPath: 'ru-hexlet-io-courses.html',
      url: urlPath,
    },
  });
});

describe('page loader, positive cases', () => {
  beforeEach(async () => {
    await Promise.all(Object.entries(assets).map(async ([assetName, asset]) => {
      const fixtureContent = await loadFixture(asset.fixturePath);
      const scope = nock(baseUrl)
        .get(asset.url)
        .reply(200, fixtureContent);
      assets[assetName].scope = scope;
      assets[assetName].fixtureContent = fixtureContent;
    }));
  });

  test.each(['image', 'css', 'script', 'html'])('verify that %s saved correctly', async (assetType) => {
    const asset = assets[assetType];
    await pageLoader(url, outputDir);
    const content = await fs.readFile(path.join(outputDir, filesDir, asset.expectedPath), 'utf-8');

    expect(content).toEqual(asset.fixtureContent);
    expect(asset.scope.isDone()).toBeTruthy();
  });

  test('verify that main html saved correctly', async () => {
    const response = await pageLoader(url, outputDir);
    const expectedPath = path.join(outputDir, 'ru-hexlet-io-courses.html');
    expect(response).toEqual({ filepath: expectedPath });
    const expectedContent = await loadFixture('expected/website.html');
    const content = await fs.readFile(expectedPath, 'utf-8');
    expect(content).toEqual(expectedContent);
  });
});

describe('page loader, negative cases', () => {
  test.each([404, 503])('should return error if server returns %d', async (httpCode) => {
    nock(baseUrl)
      .get(urlPath)
      .reply(httpCode, {});
    await expect(pageLoader(url, outputDir)).rejects.toThrowError(/Request failed/);
  });

  test('should return error if resources unavailable', async () => {
    nock(baseUrl)
      .get(urlPath)
      .reply(200, await loadFixture('website.html'));
    Object.values(assets).forEach((asset) => {
      nock(baseUrl)
        .get(asset.url)
        .reply(404, {});
    });
    await expect(pageLoader(url, outputDir)).rejects.toThrowError(/Failed to save/);
  });

  test("should return error if doesn't have write permissions to the output dir",
    async () => {
      const notWritablePath = '/p4roc';
      await expect(pageLoader(url, notWritablePath)).rejects.toThrowError(/No permissions to write/);
    });
});
