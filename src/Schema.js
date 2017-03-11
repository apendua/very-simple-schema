import createSchema from './createSchema.js';
import presetDefault from './plugins/presetDefault.js';

const Schema = createSchema([
  ...presetDefault,
]);

export default Schema;
