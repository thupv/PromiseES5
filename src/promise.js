var STATE = {
  PENDING: 1,
  FULFILLED: 2,
  REJECTED: 3
};

function Promise(fn) {
  var state = STATE.PENDING;
  var handlers = [];
  var value = undefined;

  function fulfill(result) {
    state = STATE.FULFILLED;
    value = result;
    handlers.forEach(handle);
    handlers = null;
  }

  function handle(handler) {
    if (state === STATE.PENDING) {
      handlers.push(handler);
    } else {
      if (state === STATE.FULFILLED &&
        typeof handler.onFulfilled === 'function') {
        handler.onFulfilled(value);
      }
      if (state === STATE.REJECTED &&
        typeof handler.onRejected === 'function') {
        handler.onRejected(value);
      }
    }
  }

  function reject(error) {
    state = STATE.REJECTED;
    value = error;
    handlers.forEach(handle);
    handlers = null;
  }

  function resolve(result) {
    try {
      var then = getThen(result);
      if (then) {
        doResolve(then.bind(result), resolve, reject);
        return;
      }
      fulfill(result);
    } catch (e) {
      reject(e);
    }
  }

  function getThen(value) {
    var t = typeof value;
    if (value && (t === 'object' || t === 'function')) {
      var then = value.then;
      if (typeof then === 'function') {
        return then;
      }
    }
    return null;
  }

  function doResolve(fn, onFulfilled, onRejected) {
    var done = false;
    try {
      fn(function (value) {
        if (done) return;
        done = true;
        onFulfilled(value);
      }, function (error) {
        done = true;
        onRejected(error);
      })
    } catch (ex) {
      if (done) return;
      done = true;
      onRejected(ex);
    }
  }

  this.done = function (onFulfilled, onRejected) {
    setTimeout(function () {
      handle({
        onFulfilled: onFulfilled,
        onRejected: onRejected
      });
    }, 0);
  };

  this.then = function (onFulfilled, onRejected) {
    var self = this;
    return new Promise(function (resolve, reject) {
      return self.done(function (result) {
        if (typeof onFulfilled === 'function') {
          try {
            return resolve(onFulfilled(result));
          } catch (ex) {
            return reject(ex);
          }
        } else {
          return resolve(result);
        }
      }, function (error) {
        if (typeof onRejected === 'function') {
          try {
            return resolve(onRejected(error));
          } catch (ex) {
            return reject(ex);
          }
        } else {
          return reject(error);
        }
      })
    });
  };

  this.catch = function (onRejected) {
    var self = this;
    return this.then(undefined, onRejected);

  };
  doResolve(fn, resolve, reject);
}

