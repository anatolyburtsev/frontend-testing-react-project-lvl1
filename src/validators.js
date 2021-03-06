import fs from 'fs/promises';
import { constants } from 'fs';

const isFileHasAttribute = (file, constant) => fs.access(file, constant)
  .then(() => true)
  .catch(() => false);

export const isPathWritable = (file) => isFileHasAttribute(file, constants.W_OK);

export const isResourceLocal = (baseUrl, resourceUrl) => {
  const baseUrlParsed = new URL(baseUrl);
  const resourceUrlParsed = new URL(resourceUrl);
  return baseUrlParsed.host === resourceUrlParsed.host;
};
