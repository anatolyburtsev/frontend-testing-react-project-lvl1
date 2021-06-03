const getFileNameFromUrl = (url) => {
    const parsedUrl = new URL(url);
    return url
            .replace(parsedUrl.protocol + "//", '')
            .replace(/\W/g, '-')
            .replace('_', '-')
        + ".html";
};

export default getFileNameFromUrl;
