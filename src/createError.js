import {
  isArray,
} from './validators.js';

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
    return createError(message[0], details);
  }
  if (typeof message === 'object') {
    const key = Object.keys(message)[0];
    return createError(message[key], details);
  }
  return getError(null, details);
};

export default createError;
