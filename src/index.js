import React, { Component } from './react';
import ReactDOM from './react-dom';

// function App() {
//   return <div>haha</div>;
// }

class App extends Component {
  handleClick = () => {
    console.log('click');
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
