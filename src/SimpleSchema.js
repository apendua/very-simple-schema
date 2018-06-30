import createSchema from './createSchema.js';
import presetDefault from './plugins/presetDefault.js';

const SimpleSchema = createSchema({
  plugins: [
    ...presetDefault,
  ],
  decimal: false,
  sealedByDefault: true,
  fieldsOptionalByDefault: false,
  emptyStringsAreMissingValues: true,
});

export default SimpleSchema;
