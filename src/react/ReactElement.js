import ReactCurrentOwner from './ReactCurrentOwner';
import {
  ELEMENT,
  CLASS_COMPONENT,
  FUNCTION_COMPONENT,
  TEXT,
} from '../shared/ReactSymbols';
import { flatten } from '../shared/utils';

// 这些属性不需要挂载到dom上
const RESERVED_PROPS = {
  key: true,
  ref: true,
  __self: true,
  __source: true,
};

export function createElement(type, config, ...children) {
  const props = {};
  let key = null;
  let ref = null;
  let self = null;
  let source = null;
  let $$typeof = null;

  if (typeof type === 'string') {
    // 原生组件 div span...
    $$typeof = ELEMENT;
  } else if (typeof type === 'function' && type.prototype.isReactComponent) {
    // 类组件
    $$typeof = CLASS_COMPONENT;
  } else if (typeof type === 'function') {
    // 函数组件
    $$typeof = FUNCTION_COMPONENT;
  } else {
    throw new TypeError('组件类型错误');
  }

  if (config.ref) {
    ref = config.ref;
  }

  if (config.key) {
    key = '' + config.key;
  }

  self = config.__self === undefined ? null : config.__self;
  source = config.__source === undefined ? null : config.__source;

  Object.keys(config).forEach(propName => {
    if (!RESERVED_PROPS[propName]) {
      props[propName] = config[propName];
    }
  });

  // 简化children，都设置为数组，原生react得children是可以为对象或者数组
  props.children = flatten(children).map(item => {
    if (typeof item === 'object') {
      return item;
    } else {
      return { $$typeof: TEXT, type: TEXT, content: item };
    }
  });

  if (type && type.defaultProps) {
    Object.keys(type.defaultProps).forEach(propName => {
      if (props[propName] === undefined) {
        props[propName] = type.defaultProps[propName];
      }
    });
  }

  return ReactElement(
    $$typeof,
    type,
    key,
    ref,
    self,
    source,
    ReactCurrentOwner.current,
    props
  );
}

const ReactElement = function(
  $$typeof,
  type,
  key,
  ref,
  self,
  source,
  owner,
  props
) {
  return {
    $$typeof,
    type,
    key,
    ref,
    props,
    _owner: owner,
  };
};
