import {
  getAny,
  isArray,
} from './utils.js';

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
