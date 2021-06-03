import axios from 'axios';
import {
  StatusCodes,
} from 'http-status-codes';
import path from 'path';

import fs from 'fs/promises';
import { isPathWritable, isValidUrl } from './validators.js';
import getFileNameFromUrl from './utils.js';

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

  const filepath = path.join(outputPath, getFileNameFromUrl(url));
  await fs.writeFile(filepath, response.data, 'utf-8');
};

export default pageLoader;
