export function onlyOne(obj) {
  return Array.isArray(obj) ? obj[0] : obj;
}

export function flatten(array) {
  if (!Array.isArray(array)) {
    return array;
  }
  return array.reduce((collect, item) => {
    return collect.concat(flatten(item));
  }, []);
}

/**
 * 变量所有对象所有的属性，不包含原型链
 * @param {object} obj
 * @param {(value:any, key:string)=>void} fn
 */
export function forOwn(obj, fn) {
  Object.keys(obj || {}).forEach(key => {
    fn(obj[key], key);
  });
}

/**
 * 变量所有对象所有的属性，包含原型链
 * @param {object} obj
 * @param {(value:any, key:string)=>void} fn
 */
export function forKeys(obj, fn) {
  for (const key in obj) {
    fn(obj[key], key);
  }
}

/**
 *
 * @param {string[]} strs
 */
function strToReg(strs) {
  return strs.map(omitKey => {
    omitKey = omitKey.replace('*', '.*');
    let isRegexp = omitKey.includes('.*');
    if (isRegexp) {
      return new RegExp(omitKey);
    } else {
      return omitKey;
    }
  });
}

/**
 *
 * @param {object} obj
 * @param {string[]} omitKeys
 */
export function omit(obj, omitKeys) {
  const tempKeys = strToReg(omitKeys);
  return Object.keys(obj || {}).reduce((collect, key) => {
    const isOmit = tempKeys.some(omitKey => {
      if (omitKey instanceof RegExp) {
        return omitKey.test(key);
      }
      return key === omitKey;
    });
    if (!isOmit) {
      collect[key] = obj[key];
    }
    return collect;
  }, {});
}

export function pick(obj, pickKeys) {
  const tempKeys = strToReg(pickKeys);
  return Object.keys(obj || {}).reduce((collect, key) => {
    const isPick = tempKeys.some(omitKey => {
      if (omitKey instanceof RegExp) {
        return omitKey.test(key);
      }
      return key === omitKey;
    });
    if (isPick) {
      collect[key] = obj[key];
    }
    return collect;
  }, {});
}
