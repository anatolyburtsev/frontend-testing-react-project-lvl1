import axios from 'axios';
import {
  StatusCodes,
} from 'http-status-codes';
import path from 'path';
import * as cheerio from 'cheerio';

import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import { isPathWritable, isValidUrl } from './validators.js';
import { getFileNameFromUrl, getFileNameFromUrlWithExtension } from './utils.js';

// don't throw exception on 4xx and 5xx
axios.defaults.validateStatus = () => true;

const pageLoader = async (url, outputPath) => {
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
  const imageFolderPath = getFileNameFromUrl(url, '_files');
  const imageFolderAbsolutePath = path.join(outputPath, imageFolderPath);
  await fs.mkdir(imageFolderAbsolutePath);

  const $ = cheerio.load(rawHtmlContent);
  const filesToSave = [];
  const images = $('img');
  images.each(function () {
    const oldSrc = $(this).attr('src');
    const imageUrl = new URL(oldSrc, url);
    const imageFilename = getFileNameFromUrlWithExtension(imageUrl);
    filesToSave.push({ imageUrl, imageFilename });
    const newSrc = path.join(imageFolderPath, imageFilename);
    $(this).attr('src', newSrc);
  });

  await Promise.all(
    filesToSave.map(({ imageUrl, imageFilename }) => {
      const imagePath = path.join(imageFolderAbsolutePath, imageFilename);
      return axios.get(imageUrl.href, { responseType: 'stream' })
        .then((imageResponse) => {
          imageResponse.data.pipe(createWriteStream(imagePath));
        });
    }),
  );

  // for (const { imageUrl, imageFilename } of filesToSave) {
  //   const imagePath = path.join(imageFolderAbsolutePath, imageFilename);
  //   axios.get(imageUrl.href, { responseType: 'stream' }).then((response) => {
  //     response.data.pipe(createWriteStream(imagePath))
  //   });
  // }

  const filepath = path.join(outputPath, getFileNameFromUrl(url, '.html'));
  await fs.writeFile(filepath, $.html(), 'utf-8');
};

export default pageLoader;
