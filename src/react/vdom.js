import { onlyOne, flatten, forOwn, omit } from '../shared/utils';
import {
  TEXT,
  ELEMENT,
  FUNCTION_COMPONENT,
  CLASS_COMPONENT,
} from '../shared/ReactSymbols';
import { addEventListener } from './event';

let updateDepth = 0;
let diffQueue = [];

export function compareTwoElements(oldRenderElement, newRenderElement) {
  newRenderElement = onlyOne(newRenderElement);
  let currentElement = onlyOne(oldRenderElement);
  let currentDOM = oldRenderElement.dom;
  if (newRenderElement == null) {
    // null/undefined
    currentDOM.parentNode.removeChild(currentDOM);
    currentDOM = null;
  } else if (currentElement.type !== newRenderElement.type) {
    // 比较DOM节点的类型，比如之前是div，后面改成span了
    const newDOM = createDOM(newRenderElement);
    currentDOM.parentNode.replaceChild(newDOM, currentDOM);
    currentElement = newRenderElement;
  } else {
    // 比较DOM节点的类型，比如之前是div，后面改成span了
    updateElement(currentElement, newRenderElement);
  }
  return currentElement;
}

function updateElement(currentElement, newElement) {
  const currentDOM = currentElement.dom;
  newElement.dom = currentElement.dom;
  if (currentElement.$$typeof === TEXT && newElement.$$typeof === TEXT) {
    if (currentElement.content !== newElement.content) {
      currentDOM.textContent = newElement.content;
    }
  } else if (currentElement.$$typeof === ELEMENT) {
    updateDOMProperties(currentDOM, currentElement.props, newElement.props);
    updateChildrenElements(
      currentDOM,
      currentElement.props.children,
      newElement.props.children
    );
  }
}

function updateChildrenElements(dom, oldElements, newElements) {
  updateDepth++;
  diff(dom, oldElements, newElements, diffQueue);
}

function diff(parentNode, oldChildrenElements, newChildrenElements) {
  // let;
}

function updateDOMProperties(dom, props, nextProps) {
  patchProps(dom, props, nextProps);
}

export function patchProps(dom, props, nextProps) {
  forOwn(props, (value, key) => {
    if (key === 'children') return;
    if (!nextProps.hasOwnProperty(key)) {
      // 将下次的props里面没有的属性移除
      dom.removeAttribute(key);
    }
  });

  forOwn(nextProps, (value, key) => {
    if (key === 'children') return;
    console.log(value, key);

    setProp(dom, key, value);
  });
}

function createDOM(element) {
  // react只允许使用一个根节点
  element = onlyOne(element);
  const { $$typeof } = element;
  let dom = null;
  if (!$$typeof) {
    // 字符串或者数字
    dom = document.createTextNode(element);
  } else if ($$typeof === TEXT) {
    dom = document.createTextNode(element.content);
  } else if ($$typeof === ELEMENT) {
    dom = createNativeDOM(element);
  } else if ($$typeof === FUNCTION_COMPONENT) {
    dom = createFunctionComponentDOM(element);
  } else if ($$typeof === CLASS_COMPONENT) {
    dom = createClassComponentDOM(element);
  }
  element.dom = dom;
  return dom;
}

function createFunctionComponentDOM(reactElement) {
  const { type, props } = reactElement;
  const renderElement = type(props);
  const dom = createDOM(renderElement);
  renderElement.dom = dom;
  return dom;
}

/**
 * 根据vnode获取真实DOM
 * @param {*} reactElement
 */
function createClassComponentDOM(reactElement) {
  const { type, props } = reactElement;
  const componentInstance = new type(props);
  const renderElement = componentInstance.render();
  const dom = createDOM(renderElement);
  // 便于后面做dom-diff的时候，进行dom的操作
  componentInstance.renderElement = renderElement;
  renderElement.dom = dom;
  return dom;
}

function createNativeDOM(element) {
  const { type, props } = element;

  const { children } = props;
  const dom = document.createElement(type);
  if (children) {
    createNativeDOMChildren(dom, children);
  }
  setProps(dom, props);
  return dom;
}

function createNativeDOMChildren(parentDOM, children) {
  flatten(children).forEach(child => {
    let childDOM = createDOM(child);
    parentDOM.appendChild(childDOM);
  });
}

function setProps(dom, props) {
  forOwn(omit(props, ['children']), (value, key) => {
    setProp(dom, key, value);
  });
}

function setProp(dom, key, value) {
  if (key === 'style') {
    forOwn(value, (val, key) => {
      dom.style[key] = val;
    });
  } else if (/^on/.test(key)) {
    addEventListener(dom, key, value);
  } else {
    dom.setAttribute(key, value);
  }
}

export { createDOM };
