import pageLoader from '../src/pageLoader.js';
import fs from 'fs/promises';
import { readFileSync, constants } from 'fs';
import path from 'path';
import os from 'os';
import nock from 'nock';

const loadFixture = (filename) => {
    const pathToFixtures = path.resolve(__dirname, '../__fixture__/', filename);
    return readFileSync(pathToFixtures, 'utf8');
};

const isFileExists = async (file) => {
    return fs.access(file, constants.F_OK).then(() => true).catch(() => false);
}

const mockHttpResponse = (url, filename) => {
    const response = loadFixture(filename);
    nock(url)
        .get(/.*/)
        .reply(200, response);
}

let outputDir = "";

describe("tests on page loader", () => {
    beforeEach(async () => {
        outputDir =
            await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
    });

    beforeAll(() => {
        nock.disableNetConnect();
    });

    afterEach(() => {
        nock.cleanAll();
    });

    test("should send http request and save file", async () => {
        const fixtureWebsiteFilename = "website.html";
        const url = "https://ru.hexlet.io/courses";
        mockHttpResponse(url, fixtureWebsiteFilename);
        const expectedFileContent = loadFixture(fixtureWebsiteFilename);
        const expectedOutputFile = path.join(outputDir, "ru-hexlet-io-courses.html");

        await pageLoader(url, outputDir);

        expect(isFileExists(expectedOutputFile)).toBeTruthy();
        const content = readFileSync(expectedOutputFile, 'utf-8');
        expect(content).toEqual(expectedFileContent);
    });

    test("should return error if url invalid", async () => {
        const invalidUrl = "htp://ya.ru";
        await expect(pageLoader(invalidUrl, outputDir)).rejects.toThrowError(/Invalid url/);
    });

    test("should return error if server returns 4XX", async () => {
        const url = "http://ya.ru";
        nock(url)
            .get("/")
            .reply(404, {});
        await expect(pageLoader(url, outputDir)).rejects.toThrowError(/Request failed/);
    });

    test("should return error if doesn't have write permissions to the output dir",
        async () => {
            const notWritablePath = "/proc";
            await expect(pageLoader("http://ya.ru/", notWritablePath)).rejects.toThrowError(/No permissions to write/);
        });
})
