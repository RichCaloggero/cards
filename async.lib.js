// a 'mini library' (save it somewhere and import it once/project)
(() => {
  let AsyncFunction = Object.getPrototypeOf(async e => e).constructor;
  ['map', 'forEach'].forEach(method => {
    let orgMethod = Array.prototype[method];
    Array.prototype[method] = function (func) {
      let a = orgMethod.call(this, func);
      return func instanceof AsyncFunction ? Promise.all(a) : a;
    };
  });
  ['filter', 'some', 'every'].forEach(method => {
    let orgMethod = Array.prototype[method];
    Array.prototype[method] = function (func) {
      if (func instanceof AsyncFunction) {
        return (async () => {
          let trueOrFalse = await this.map(func);
          return orgMethod.call(this, (_x, i) => trueOrFalse[i]);
        })();
      }
      else {
        return orgMethod.call(this, func);
      }
    };
  });
  ['reduce', 'reduceRight'].forEach(method => {
    let orgMethod = Array.prototype[method];
    Array.prototype[method] = function (...args) {
      if (args[0] instanceof AsyncFunction) {
        let orgFunc = args[0];
        args[0] = async (...args) => {
          args[0] = await args[0];
          return orgFunc.apply(this, args);
        };
      }
      return orgMethod.apply(this, args);
    };
  });
})();
