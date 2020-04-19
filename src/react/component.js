import { createDOM } from './vdom';
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
    const renderReactElement = this.render();
    const dom = createDOM(renderReactElement);
    const oldDom = this.dom;
    oldDom.replaceWith(dom);
    this.dom = dom;
  }

  render() {
    throw new Error('需要子组件复写该还是');
  }
}

Component.prototype.isReactComponent = {};

export { Component };
