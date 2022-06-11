const { customAlphabet, nanoid } = require('nanoid');

const DEFAULT_LENGTH = 10;

function mongooseNanoidPlugin(schema, opts) {
  opts.length = opts.length || DEFAULT_LENGTH;

  const prefix = schema.options._idPrefix || '';
  const postfix = schema.options._idPostfix || '';

  const fieldObj = {};

  fieldObj._id = {
    type: String,
    default: function () {
      let kindPrefix = '';

      if (this.kind) {
        kindPrefix = this.kind[0];
      }

      return kindPrefix + prefix + generateId(opts) + postfix;
    },
  };

  schema.add(fieldObj);
  schema.pre('save', async function (next) {
    if (!this.$isNew || this.$__parent) return next();

    try {
      const id = await attemptToGenerate(this, opts);

      let kindPrefix = '';

      if (this.kind) {
        kindPrefix = this.kind[0];
      }

      this._id = kindPrefix + prefix + id + postfix;

      next();
    } catch (e) {
      next();
    }
  });
}

function generateId(opts) {
  if (opts.alphabet) return customAlphabet(opts.alphabet)(opts.length);

  return nanoid(opts.length);
}

async function attemptToGenerate(doc, opts) {
  const Model = doc.constructor;
  const id = generateId(opts);

  const existing = await Model.findById(id);

  if (existing) return attemptToGenerate(doc, opts);

  return id;
}

module.exports = mongooseNanoidPlugin;
