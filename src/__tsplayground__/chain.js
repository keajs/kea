// This is an implementation of chain() in VanillaJS.
// It supports map(), reduce(), mapValues() and has an auto-closing sum() method.
class WrappedValue {
  constructor(v) {
    this.v = v;
  }

  filter(fn) {
    this.v = this.v.filter(fn);
    return this;
  }
  reduce(fn, x) {
    this.v = this.v.reduce(fn, x);
    return this;
  }
  map(fn) {
    if (typeof(fn) === 'string') {
      this.v = this.v.map(v => v[fn]);
    } else {
      this.v = this.v.map(fn);
    }
    return this;
  }
  mapValues(fn) {
    for (const k in this.v) { this.v[k] = fn(this.v[k], k); }
    return this;
  }
  sum(fn) {
    return this.reduce((a, b) => a + b, 0).value();  // auto-close
  }
  value() {
    return this.v;
  }
}

function chain(value) {
  return new WrappedValue(value);
}

// (This isn’t at all how Lodash’s implicit chain is implemented.
// It uses lazy evaluation to get some nice optimizations.)