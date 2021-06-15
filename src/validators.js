import * as yup from 'yup';
import fs from 'fs/promises';
import { constants } from 'fs';

const urlSchema = yup.string().matches(
  /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
).required();

export const isValidUrl = (string) => urlSchema.isValidSync(string);

const isFileHasAttribute = async (file, constant) => fs.access(file, constant)
  .then(() => true)
  .catch(() => false);

export const isFileExists = async (file) => isFileHasAttribute(file, constants.F_OK);

export const isPathWritable = async (file) => isFileHasAttribute(file, constants.W_OK);

export const isResourceLocal = (baseUrl, resourceUrl) => {
  const baseUrlParsed = new URL(baseUrl);
  const resourceUrlParsed = new URL(resourceUrl);
  return baseUrlParsed.host === resourceUrlParsed.host;
};
