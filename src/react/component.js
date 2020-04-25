import { compareTwoElements } from './vdom';
import Updater from './updateQueue';

class Component {
  constructor(props = {}) {
    this.props = props;
    this.state = {};
    this.updater = new Updater(this);
  }
  setState(partialState) {
    this.updater.addState(partialState);
  }
  /**
   * 强制更新组件
   */
  forceUpdate() {
    const { renderElement } = this;
    // 重新获取一个新的reactElement，每次setState的时候都会重新的去调用render函数
    // 然后比较新的与老的差别(dom-diff)，更新dom
    const newRenderElement = this.render();
    const currentElement = compareTwoElements(renderElement, newRenderElement);
    this.renderElement = currentElement;
  }

  render() {
    throw new Error('需要子组件复写该还是');
  }
}

Component.prototype.isReactComponent = {};

export { Component };
