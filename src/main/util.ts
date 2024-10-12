/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';

/**
 * Converts an absolute HTML path to a loopback or file:// path, respecting the build type and
 * configuration.
 * @param htmlFileName - the HTML path to convert.
 * @returns The HTML path converted to a path suitable for the build type.
 */
export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}
