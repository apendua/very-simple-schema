import createSchema from './createSchema.js';
import presetDefault from './plugins/presetDefault.js';

const Schema = createSchema({
  plugins: [
    ...presetDefault,
  ],
});

export default Schema;
