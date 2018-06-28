import {
  has,
  isArray,
} from './utils.js';

const getAny = (object) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const k in object) {
    if (has(object, k)) {
      return object[k];
    }
  }
  return undefined;
};

const getError = (message, details) => {
  const error = new Error(message || 'Unknown error');
  error.details = details;
  return error;
};

const createError = (message, details) => {
  if (typeof message === 'string') {
    return getError(message, details);
  }
  if (isArray(message)) {
    return createError(message.find(x => !!x), details);
  }
  if (typeof message === 'object') {
    return createError(getAny(message), details);
  }
  return getError(null, details);
};

export default createError;
