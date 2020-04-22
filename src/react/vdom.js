import { onlyOne, flatten, forOwn, omit } from '../shared/utils';
import {
  TEXT,
  ELEMENT,
  FUNCTION_COMPONENT,
  CLASS_COMPONENT,
} from '../shared/ReactSymbols';
import { addEventListener } from './event';

const MOVE = 'MOVE';
const INSERT = 'INSERT';
const REMOVE = 'REMOVE';

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

/**
 *
 * @param {*} currentElement 当前页面上渲染对应的reactElement
 * @param {*} newElement 下一次新的reactElement
 */
function updateElement(currentElement, newElement) {
  const currentDOM = currentElement.dom;
  newElement.dom = currentElement.dom;
  if (currentElement.$$typeof === TEXT && newElement.$$typeof === TEXT) {
    if (currentElement.content !== newElement.content) {
      currentDOM.textContent = newElement.content;
    }
  } else if (currentElement.$$typeof === ELEMENT) {
    // 先更新dom属性
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
  updateDepth--;
  if (updateDepth === 0) {
    patch(diffQueue);
    diffQueue.length = 0;
  }
}

function patch(diffQueue) {
  debugger;
  let deleteMap = {};
  let deleteChildren = [];
  for (let index = 0; index < diffQueue.length; index++) {
    const element = diffQueue[index];
    const { type, fromIndex } = element;
    if ([MOVE, REMOVE].includes(type)) {
      let oldChildDOM = element.parentNode.children[fromIndex];
      deleteMap[fromIndex] = oldChildDOM;
      deleteChildren.push(oldChildDOM);
    }
  }
  deleteChildren.forEach(childDOM => {
    childDOM.parentNode.removeChild(childDOM);
  });
  for (let index = 0; index < diffQueue.length; index++) {
    const element = diffQueue[index];
    const { type, fromIndex, toIndex, parentNode, dom } = element;
    switch (type) {
      case INSERT:
        insertChildAt(parentNode, dom, toIndex);
        break;
      case MOVE:
        insertChildAt(parentNode, deleteMap[fromIndex], toIndex);
        break;
      default:
        break;
    }
  }
}

function insertChildAt(parentNode, dom, index) {
  let oldChild = parentNode.children[index];
  if (oldChild) {
    parentNode.insertBefore(dom, oldChild);
  } else {
    parentNode.appendChild(dom);
  }
}

function diff(parentNode, oldChildrenElements, newChildrenElements, diffQueue) {
  let oldChildrenElementsMap = getChildrenElementsMap(oldChildrenElements);
  let newChildrenElementsMap = getNewChildrenElementsMap(
    oldChildrenElementsMap,
    newChildrenElements
  );
  let lastIndex = 0;
  for (let index = 0; index < newChildrenElements.length; index++) {
    const newChildElement = newChildrenElements[index];
    if (newChildElement) {
      let key = newChildElement.key || `${index}`;
      let oldChildElement = oldChildrenElementsMap.get(key);
      if (newChildElement === oldChildElement) {
        // 复用老节点
        if (oldChildElement._mountIndex < lastIndex) {
          diffQueue.push({
            parentNode,
            type: MOVE,
            fromIndex: oldChildElement._mountIndex,
            toIndex: index,
          });
        }
        lastIndex = Math.max(oldChildElement._mountIndex, lastIndex);
      } else {
        diffQueue.push({
          parentNode,
          type: INSERT,
          toIndex: index,
          dom: createDOM(newChildElement),
        });
      }
    } else {
      // 之前有，现在没有了，那么就表示组件要卸载掉
      let key = `${index}`;
      const oldChildElement = oldChildrenElementsMap.get(key);
      if (
        oldChildElement.componentInstance &&
        oldChildElement.componentInstance.componentWillUnmount
      ) {
        oldChildElement.componentInstance.componentWillUnmount();
      }
    }

    // 遍历现有的元素
    oldChildrenElementsMap.forEach((oldChildElement, key) => {
      if (!newChildrenElementsMap.has(key)) {
        diffQueue.push({
          parentNode,
          type: REMOVE,
          fromIndex: oldChildElement._mountIndex,
        });
      }
    });
  }
}

/**
 * 比较每个reactElement的key和type
 */
function getNewChildrenElementsMap(
  oldChildrenElementsMap,
  newChildrenElements
) {
  let newChildrenElementsMap = new Map();
  for (let index = 0; index < newChildrenElements.length; index++) {
    let newChildElement = newChildrenElements[index];
    // null
    if (!newChildElement) continue;
    let key = newChildElement.key || `${index}`;
    let oldChildElement = oldChildrenElementsMap.get(key);
    // key相同，原生类型也相同那么就复用原来的reactElement
    if (canDeepCompare(oldChildElement, newChildElement)) {
      updateElement(oldChildElement, newChildElement);
      newChildElement = oldChildElement;
    }
    newChildrenElementsMap.set(key, newChildElement);
  }
  return newChildrenElementsMap;
}

function canDeepCompare(oldChildElement, newChildElement) {
  // 如果有一个不存在，那么就返回false
  if (!!oldChildElement && !!newChildElement) {
    // 如果dom标签类型一样就是true
    return oldChildElement.type === newChildElement.type;
  }

  return false;
}

/**
 *  生成一个key和reactElement的对应关系
 * @param {reactElement[]} oldChildrenElements reactElement数组
 */
function getChildrenElementsMap(oldChildrenElements) {
  let oldChildrenElementsMap = new Map();
  console.log(oldChildrenElements);

  for (let index = 0; index < oldChildrenElements.length; index++) {
    const element = oldChildrenElements[index];
    let key = element.key || `${index}`;
    oldChildrenElementsMap.set(key, element);
  }
  return oldChildrenElementsMap;
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
  flatten(children).forEach((child, index) => {
    child._mountIndex = index;
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
