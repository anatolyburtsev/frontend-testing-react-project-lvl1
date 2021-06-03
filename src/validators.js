import * as yup from 'yup';
import fs from 'fs/promises';
import { constants } from 'fs';

const urlSchema = yup.string().url().required();

export const isValidUrl = (string) => urlSchema.isValidSync(string);

export const isFileExists = async (file) => fs.access(file, constants.F_OK)
  .then(() => true)
  .catch(() => false);

export const isPathWritable = async (file) => fs.access(file, constants.W_OK)
  .then(() => true)
  .catch(() => false);
