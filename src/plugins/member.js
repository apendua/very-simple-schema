import {
  combine,
} from '../validators.js';
import {
  ERROR_MISSING_FIELD,
} from '../constants.js';
import {
  isPlainObject,
} from '../utils.js';

const validateIsMissing = value => (value === null || value === undefined ? { error: ERROR_MISSING_FIELD } : undefined);

const pluginMember = {
  compile(compiler, schemaDef) {
    if (schemaDef instanceof compiler.Schema.Member) {
      const compiled = compiler.compile(schemaDef.schemaDef, schemaDef.otherOptions);
      return {
        ...compiled,
        validate: combine([
          !schemaDef.optional && validateIsMissing,
          compiled.validate,
        ]),
      };
    }
    return null;
  },
  mixin(Schema) {
    class Member {
      constructor({ type: schemaDef, optional, ...otherOptions }) {
        if (!schemaDef) {
          throw new Error('Missing type for member');
        }
        Object.assign(this, {
          optional,
          schemaDef,
          otherOptions,
        });
      }
    }
    Object.assign(Schema, {
      Member,
      member: (schemaDef) => {
        if (!isPlainObject(schemaDef)) {
          return new Schema(new Member({ type: schemaDef }));
        }
        return new Schema(new Member(schemaDef));
      },
    });
  },
};

export default pluginMember;
