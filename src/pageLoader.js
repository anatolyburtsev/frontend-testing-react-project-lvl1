import axios from 'axios';
import {
  StatusCodes,
} from 'http-status-codes';
import path from 'path';
import * as cheerio from 'cheerio';
import _ from 'lodash';
import fs from 'fs/promises';
import debug from 'debug';
import {
  isPathWritable, isResourceLocal,
} from './validators.js';
import { getFileNameFromUrl, getFileNameFromUrlWithExtension } from './utils.js';

const log = debug('page-loader');

const processResourceType = ({
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
  htmlContent,
  url,
  filesFolderPath,
}) => {
  log('Starting parsing html');

  const $ = cheerio.load(htmlContent);
  const imagesToSave = processResourceType({
    htmlCheerio: $,
    resourceType: 'img',
    url,
    filesFolderPath,
  });

  log(`${imagesToSave.length} images found`);
  const scriptsToSave = processResourceType({
    htmlCheerio: $,
    resourceType: 'script',
    url,
    filesFolderPath,
    skipExternal: true,
  });

  log(`${scriptsToSave.length} scripts found`);
  const linksToSave = processResourceType({
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

const downloadAndSave = (url, filepath) => axios.get(url, { responseType: 'arraybuffer' })
  .then((response) => fs.writeFile(filepath, response.data))
  .then(() => log(`${filepath} saved`))
  .catch((error) => {
    throw new Error(`Failed to save ${filepath}. error: ${error.message}`);
  });
const downloadFiles = ({
  filesToSave, filesFolderAbsolutePath,
}) => {
  const uniqFilesToSave = _.uniq(filesToSave);
  const filenames = uniqFilesToSave.map(({ filename }) => filename).join('\n');
  log(`Downloading ${uniqFilesToSave.length} files: \n${filenames}`);
  return Promise.all(
    uniqFilesToSave.map(
      ({ fileUrl, filename }) => downloadAndSave(fileUrl.href,
        path.join(filesFolderAbsolutePath, filename)),
    ),

  );
};

export default async (url, outputPath = process.cwd()) => {
  if (!await isPathWritable(outputPath)) {
    throw new Error(`No permissions to write to ${outputPath}`);
  }

  const response = await axios.get(url);
  if (response.status !== StatusCodes.OK) {
    throw new Error(`Request failed, status code: ${response.status}`);
  }

  const filesFolderPath = getFileNameFromUrl(url, '_files');
  const filesFolderAbsolutePath = path.join(outputPath, filesFolderPath);
  await fs.mkdir(filesFolderAbsolutePath);
  log(`Path to files: ${filesFolderAbsolutePath}`);

  const processedPage = processPage({
    htmlContent: response.data, url, filesFolderPath,
  });

  const mainHTMLFilePath = path.join(outputPath, getFileNameFromUrl(url, '.html'));
  await fs.writeFile(mainHTMLFilePath, processedPage.content, 'utf-8');
  log(`main html saved to ${mainHTMLFilePath}`);

  await downloadFiles({
    filesToSave: processedPage.filesToSave,
    filesFolderAbsolutePath,
  });
  log(`files saved to ${filesFolderAbsolutePath}`);

  return {
    filepath: mainHTMLFilePath,
  };
};
