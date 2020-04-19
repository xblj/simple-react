const updaters = [];
let isPending = false;

/**
 * @typedef {import('./component').Component} Component
 */

/**
 * 更新队列是否是批量更新
 * @param {boolean} isBatchUpdate
 */
function setUpdateQueueState(isBatchUpdate) {
  isPending = isBatchUpdate;
}

/**
 * 将需要更新的updater放入队列中
 * @param {} updater
 */
function addUpdater(updater) {
  updaters.push(updater);
}

/**
 * 批量去更新组件
 */
function batchUpdate() {
  isPending = true;
  let updater;
  do {
    updater = updaters.pop();
    if (updater) {
      updater.updateComponent();
    }
  } while (updater);
  isPending = false;
}

export default class Updater {
  /**
   *
   * @param {Component} componentInstance
   */
  constructor(componentInstance) {
    this.componentInstance = componentInstance;

    this.pendingStates = [];
    this.nextProps = null;
  }

  /**
   * 将每次setState的值保存到updater里
   * @param {function|object} partialState
   */
  addState(partialState) {
    this.pendingStates.push(partialState);
    this.emitUpdate();
  }

  emitUpdate(nextProps) {
    this.nextProps = nextProps;
    if (nextProps || !isPending) {
      this.updateComponent();
    } else {
      addUpdater(this);
    }
  }

  updateComponent() {
    const { componentInstance, pendingStates, nextProps } = this;
    if (nextProps || pendingStates.length > 0) {
      shouldUpdate(componentInstance, nextProps, this.getState());
    }
  }

  /**
   * 根据老的state和调用setState传入的partialState合并成一个新的state返回
   */
  getState() {
    const { componentInstance, pendingStates } = this;
    let { state } = componentInstance;
    let nextState;
    do {
      nextState = pendingStates.shift();
      if (nextState) {
        if (typeof nextState === 'function') {
          state = nextState.call(componentInstance, state);
        } else {
          state = { ...state, ...nextState };
        }
      }
    } while (pendingStates.length > 0);
    return state;
  }
}

/**
 *
 * @param {Component} componentInstance
 * @param {*} nextProps
 * @param {*} nextState
 */
function shouldUpdate(componentInstance, nextProps, nextState) {
  const { shouldComponentUpdate } = componentInstance;
  let isUpdate = true;
  if (shouldComponentUpdate) {
    isUpdate = shouldComponentUpdate.call(
      componentInstance,
      nextProps,
      nextState
    );
  }
  // 不更新组件但是属性和状态还是得改变
  componentInstance.props = nextProps;
  componentInstance.state = nextState;
  if (isUpdate) {
    componentInstance.forceUpdate();
  }
}

export { addUpdater, batchUpdate, isPending, setUpdateQueueState };
