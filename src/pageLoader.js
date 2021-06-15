import axios from 'axios';
import {
  StatusCodes,
} from 'http-status-codes';
import path from 'path';
import * as cheerio from 'cheerio';
import _ from 'lodash';

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

const processPage = ({
  rawHtmlContent,
  url,
  filesFolderPath,
  log,
}) => {
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
  return {
    content: $.html(),
    filesToSave,
  };
};

const downloadFiles = async ({
  filesToSave, filesFolderAbsolutePath, log,
}) => {
  const uniqFilesToSave = _.uniq(filesToSave);// .filter((el) => el.fileUrl.href !== url);
  const filenames = uniqFilesToSave.map(({ filename }) => filename).join('\n');
  log(`Downloading ${uniqFilesToSave.length} files: \n${filenames}`);
  const fileContents = await Promise.all(
    uniqFilesToSave.map(({ fileUrl }) => axios.get(fileUrl.href, { responseType: 'stream' })),
  );
  const failedToDownload = [];

  uniqFilesToSave.forEach(({ filename }, idx) => {
    const filePath = path.join(filesFolderAbsolutePath, filename);
    const fileStream = createWriteStream(filePath);
    const content = fileContents[idx];
    if (content.status !== StatusCodes.OK) {
      failedToDownload.push(filename);
      log(`failed to download ${filename}`);
    } else {
      content.data.pipe(fileStream);
      log(`saved ${filename}`);
    }
  });
  return {
    failedToDownload,
  };
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
  log(`Path to files: ${filesFolderAbsolutePath}`);

  const processedPage = processPage({
    rawHtmlContent, url, filesFolderPath, log,
  });

  const filepath = path.join(outputPath, getFileNameFromUrl(url, '.html'));
  await fs.writeFile(filepath, processedPage.content, 'utf-8');
  log(`main html saved to ${filepath}`);

  const { failedToDownload } = await downloadFiles({
    filesToSave: processedPage.filesToSave,
    filesFolderAbsolutePath,
    log,
  });

  if (failedToDownload.length > 0) {
    throw new Error(`Failed to download several resources: ${failedToDownload}`);
  }

  await new Promise((r) => setTimeout(r, 10));
  return {
    filepath,
  };
};

export default pageLoader;
