import { createDOM } from '../react/vdom';

function render(element, container, callback) {
  const dom = createDOM(element);
  container.appendChild(dom);
}

export default {
  render,
};
