import { forOwn } from '../shared/utils';

export function addEventListener(dom, eventType, listener) {
  eventType = eventType.toLowerCase();
  // 将所有的事件处理函数放在eventStore
  let eventStore = dom.eventStore || (dom.eventStore = {});
  eventStore[eventType] = listener;
  document.addEventListener(eventType.slice(2), dispatchEvent, false);
}

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
    syntheticEvent[key] = null;
  });
}

function getSyntheticEvent(nativeEvent) {
  if (!syntheticEvent) {
    syntheticEvent = {};
  }
  forOwn(nativeEvent, (value, key) => {
    if (typeof value === 'function') {
      syntheticEvent[key] = value.bind(nativeEvent);
    } else {
      syntheticEvent[key] = value;
    }
  });
  return syntheticEvent;
}
