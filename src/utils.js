export const getFileNameFromUrl = (url, suffix) => {
  const parsedUrl = new URL(url);
  return `${parsedUrl.href
    .replace(`${parsedUrl.protocol}//`, '')
    .replace(/\W/g, '-')
    .replace('_', '-')
  }${suffix}`;
};

export const getFileNameFromUrlWithExtension = (url) => {
  const parsedUrl = new URL(url);
  const pathParts = parsedUrl.pathname.split('.');
  if (pathParts.length !== 2) {
    throw new Error(`expected URL with path with 1 dot, received: ${parsedUrl.href}`);
  }
  let ext;
  [parsedUrl.pathname, ext] = pathParts;

  return getFileNameFromUrl(parsedUrl.href, `.${ext}`);
};
