export const getFileNameFromUrl = (url, suffix) => {
  const parsedUrl = new URL(url);
  return `${parsedUrl.href
    .replace(`${parsedUrl.protocol}//`, '')
    .replace(/\W/g, '-')
    .replace('_', '-')
  }${suffix}`;
};

export const getFileNameFromUrlWithExtension = (url, defaultExt = 'html') => {
  const parsedUrl = new URL(url);
  const pathParts = parsedUrl.pathname.split('.');
  if (pathParts.length > 2) {
    throw new Error(`expected URL with path with 1 dot, received: ${parsedUrl.href}`);
  }

  let parsedExt;
  [parsedUrl.pathname, parsedExt] = pathParts;
  const urlWithoutExt = parsedUrl.href;
  const ext = parsedExt ?? defaultExt;

  return getFileNameFromUrl(urlWithoutExt, `.${ext}`);
};
