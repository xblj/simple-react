import { forOwn, forKeys } from '../shared/utils';

export function addEventListener(dom, eventType, listener) {
  eventType = eventType.toLowerCase();
  // 将所有的事件处理函数放在eventStore
  let eventStore = dom.eventStore || (dom.eventStore = {});
  eventStore[eventType] = listener;
  document.addEventListener(eventType.slice(2), dispatchEvent, false);
}

// 合成事件对象，全局就一份，事件处理完成所有的属性都会被赋值为null，所以在事件的setTimeout里面是无法拿到事件
// 里面的属性的，可以调用合成事件persist将事件对象持久化。
let syntheticEvent;

function dispatchEvent(event) {
  let { type, target } = event;
  let eventType = `on${type}`;
  syntheticEvent = getSyntheticEvent(event);
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
