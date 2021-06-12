import axios from 'axios';
import {
  StatusCodes,
} from 'http-status-codes';
import path from 'path';
import * as cheerio from 'cheerio';

import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import debug from 'debug';
import {
  isPathWritable, isValidUrl, isResourceLocal,
} from './validators.js';
import { getFileNameFromUrl, getFileNameFromUrlWithExtension } from './utils.js';

// don't throw exception on 4xx and 5xx
axios.defaults.validateStatus = () => true;

const processResources = ({
  htmlCheerio,
  resourceType,
  url,
  filesFolderPath,
  srcTagName = 'src',
  skipExternal = false,
}) => {
  const filesToSave = [];
  htmlCheerio(resourceType).each(function () {
    const oldSrc = htmlCheerio(this).attr(srcTagName);
    if (oldSrc === undefined) {
      return;
    }
    const fileUrl = new URL(oldSrc, url);
    if (skipExternal && !isResourceLocal(url, fileUrl)) {
      return;
    }
    const filename = getFileNameFromUrlWithExtension(fileUrl);
    filesToSave.push({ fileUrl, filename });
    const newSrc = path.join(filesFolderPath, filename);
    htmlCheerio(this).attr(srcTagName, newSrc);
  });

  return filesToSave;
};

const pageLoader = async (url, outputPath) => {
  const log = debug('page-loader');
  if (!isValidUrl(url)) {
    throw new Error(`Invalid url: ${url}`);
  }

  if (!await isPathWritable(outputPath)) {
    throw new Error(`No permissions to write to ${outputPath}`);
  }

  const response = await axios.get(url);
  if (response.status !== StatusCodes.OK) {
    throw new Error(`Request failed, status code: ${response.status}`);
  }

  const rawHtmlContent = response.data;
  const filesFolderPath = getFileNameFromUrl(url, '_files');
  const filesFolderAbsolutePath = path.join(outputPath, filesFolderPath);
  await fs.mkdir(filesFolderAbsolutePath);

  log('Starting parsing html');
  const $ = cheerio.load(rawHtmlContent);

  const imagesToSave = processResources({
    htmlCheerio: $,
    resourceType: 'img',
    url,
    filesFolderPath,
  });
  log(`${imagesToSave.length} images found`);

  const scriptsToSave = processResources({
    htmlCheerio: $,
    resourceType: 'script',
    url,
    filesFolderPath,
    skipExternal: true,
  });
  log(`${scriptsToSave.length} scripts found`);

  const linksToSave = processResources({
    htmlCheerio: $,
    resourceType: 'link',
    url,
    filesFolderPath,
    skipExternal: true,
    srcTagName: 'href',
  });
  log(`${linksToSave.length} links and css found`);

  const filesToSave = [...imagesToSave, ...scriptsToSave, ...linksToSave];
  const downloadedResources = [url];

  log('start downloading files');
  await Promise.all(
    filesToSave.map(({ fileUrl, filename }) => {
      if (downloadedResources.includes(fileUrl.href)) {
        return Promise.resolve();
      }
      downloadedResources.push(fileUrl.href);

      const filePath = path.join(filesFolderAbsolutePath, filename);
      log(`downloading ${filename}`);
      return axios.get(fileUrl.href, { responseType: 'stream' })
        .then((imageResponse) => imageResponse.data.pipe(createWriteStream(filePath)))
        .then(() => log(`downloaded ${filename}`));
    }),
  );
  log('finish downloading files');

  const filepath = path.join(outputPath, getFileNameFromUrl(url, '.html'));
  await fs.writeFile(filepath, $.html(), 'utf-8');
};

export default pageLoader;
