import { removeTrailingSlash } from './utils/string';

export const IS_DEV = import.meta.env.MODE === 'development';

export const API_SERVER = IS_DEV ? '' : removeTrailingSlash(import.meta.env.VITE_API_SERVER || '');

export const MEDIA_SERVER = IS_DEV ? '' : removeTrailingSlash(import.meta.env.VITE_MEDIA_SERVER || '');
