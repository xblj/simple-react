import React, { Component } from './react';
import ReactDOM from './react-dom';

// function App() {
//   return <div>haha</div>;
// }

class App extends Component {
  handleClick = e => {
    console.log(e.target);
    e.persist();
    setTimeout(() => {
      console.log(e);
    }, 0);
  };
  render() {
    return (
      <div
        style={{ color: 'red' }}
        className="app"
        id="app"
        onClick={this.handleClick}
      >
        我是类组件
      </div>
    );
  }
}

// const element = React.createElement('div', {}, '我是原生组件');

ReactDOM.render(<App />, document.getElementById('root'));
