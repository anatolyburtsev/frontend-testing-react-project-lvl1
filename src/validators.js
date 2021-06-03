import * as yup from 'yup';
import fs from 'fs/promises';
import { constants } from 'fs';

const urlSchema = yup.string().url().required();

export const isValidUrl = (string) => urlSchema.isValidSync(string);

const isFileHasAttribute = async (file, constant) => fs.access(file, constant)
  .then(() => true)
  .catch(() => false);

export const isFileExists = async (file) => isFileHasAttribute(file, constants.F_OK);

export const isPathWritable = async (file) => isFileHasAttribute(file, constants.W_OK);
