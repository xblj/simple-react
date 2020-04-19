import { forOwn, forKeys } from '../shared/utils';
import { setUpdateQueueState, batchUpdate } from './updateQueue';

/**
 * TODO: focus?
 */

/**
 * 添加时间委托，会将添加到dom元素上的所有事件都会委托到document上
 * @param {HTMLElement} dom
 * @param {string} eventType
 * @param {function} listener
 */
export function addEventListener(dom, eventType, listener) {
  // 绑定事件使用的是onClick，转换为小写便于后续处理
  eventType = eventType.toLowerCase();
  // 在真实dom对象上添加一个自定义的属性eventStore，用于存储所有的事件监听函数
  let eventStore = dom.eventStore;
  if (!eventStore) {
    eventStore = {};
    dom.eventStore = eventStore;
  }
  eventStore[eventType] = listener;
  // 将事件委托给document
  document.addEventListener(eventType.slice(2), dispatchEvent, false);
}

// 合成事件对象，全局就一份，事件处理完成所有的属性都会被赋值为null，所以在事件的setTimeout里面是无法拿到事件
// 里面的属性的，可以调用合成事件persist将事件对象持久化。
let syntheticEvent;

/**
 * 派发事件，当页面有交互事件时，事件会冒泡到document上，这个时候就会触发次函数的调用
 * @param {Event} event
 */
function dispatchEvent(event) {
  let { type, target } = event;
  let eventType = `on${type}`;
  syntheticEvent = getSyntheticEvent(event);
  // 合成事件使用批量更新模式
  setUpdateQueueState(true);
  while (target) {
    const { eventStore } = target;
    let listener = eventStore && eventStore[eventType];
    if (listener) {
      listener.call(target, syntheticEvent);
    }
    target = target.parentNode;
  }
  forOwn(syntheticEvent, (value, key) => {
    if (key === 'persist') {
      return;
    }
    syntheticEvent[key] = null;
  });
  // 合成事件走完了，那么久执行批量更新的逻辑
  batchUpdate();
}

function persist() {
  syntheticEvent = { ...syntheticEvent };
}

function getSyntheticEvent(nativeEvent) {
  if (!syntheticEvent) {
    syntheticEvent = {
      persist,
    };
  }
  forKeys(nativeEvent, (value, key) => {
    if (typeof value === 'function') {
      syntheticEvent[key] = value.bind(nativeEvent);
    } else {
      syntheticEvent[key] = value;
    }
  });
  return syntheticEvent;
}
