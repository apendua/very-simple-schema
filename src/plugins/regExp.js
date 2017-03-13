/* eslint max-len: "off", no-useless-escape: "off", no-param-reassign: "off" */
import {
  ERROR_DOES_NOT_MATCH,
} from '../constants.js';

const pluginRegExp = {
  compile(compiler, schemaDef, schemaOptions) {
    let { regEx } = schemaOptions;
    if (regEx) {
      let expected;
      if (regEx instanceof RegExp) {
        expected = `match ${regEx.toString()}`;
      } else if (regEx && typeof regEx === 'object' && regEx.re instanceof RegExp) {
        expected = regEx.to || `match ${regEx.re.toString()}`;
        regEx = regEx.re;
      } else {
        throw Error('Invalid regEx settings');
      }
      return {
        validate: value => (regEx.test(value) ? undefined : { error: ERROR_DOES_NOT_MATCH, expected }),
      };
    }
    return null;
  },
  mixin(Schema) {
    Schema.RegEx = {
      Id: {
        re: /^[23456789ABCDEFGHJKLMNPQRSTWXYZabcdefghijkmnopqrstuvwxyz]{17}$/,
        to: 'be a valid identifier',
      },
      Email: {
        re: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
        to: 'be a valid email',
      },
    };
  },
};

export default pluginRegExp;
