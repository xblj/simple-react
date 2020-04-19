import { onlyOne, flatten, forOwn, omit, pick } from '../shared/utils';
import {
  TEXT,
  ELEMENT,
  FUNCTION_COMPONENT,
  CLASS_COMPONENT,
} from '../shared/ReactSymbols';
import { addEventListener } from './event';

function createDOM(element) {
  // react只允许使用一个根节点
  element = onlyOne(element);
  const { $$typeof, type, props } = element;
  let dom = null;
  if (!$$typeof) {
    // 字符串或者数字
    dom = document.createTextNode(element);
  } else if ($$typeof === TEXT) {
    dom = document.createTextNode(element.context);
  } else if ($$typeof === ELEMENT) {
    dom = createNativeDOM(element);
  } else if ($$typeof === FUNCTION_COMPONENT) {
    const renderElement = type();
    dom = createDOM(renderElement);
  } else if ($$typeof === CLASS_COMPONENT) {
    const componentInstance = new type();
    const renderElement = componentInstance.render();
    dom = createDOM(renderElement);
    componentInstance.dom = dom;
  }
  return dom;
}

function createNativeDOM(element) {
  const { type, props } = element;

  const { children } = props;
  const dom = document.createElement(type);
  if (children) {
    createNativeDOMChildren(dom, children);
  }
  setInitialProperty(dom, props);
  return dom;
}

function createNativeDOMChildren(parentDOM, children) {
  flatten(children).forEach(child => {
    let childDOM = createDOM(child);
    parentDOM.appendChild(childDOM);
  });
}

function setInitialProperty(dom, props) {
  if (props.style) {
    forOwn(props.style, (value, key) => {
      dom.style[key] = value;
    });
  }

  // 普通属性绑定
  forOwn(omit(props, ['style', 'children', 'on*']), (value, key) => {
    dom.setAttribute(key, value);
  });

  // 事件绑定
  forOwn(pick(props, ['on*']), (value, key) => {
    addEventListener(dom, key, value);
  });
}

export { createDOM };
