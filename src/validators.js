import * as yup from "yup";
import fs from "fs";

const urlSchema = yup.string().url().required();

export const isValidUrl = (string) => urlSchema.isValidSync(string);

export const isPathWritable = (path) => {
    try {
        fs.accessSync(path, fs.constants.W_OK);
        return true
    } catch {}
    return false;
}
