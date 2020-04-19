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
