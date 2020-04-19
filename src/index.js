import React, { Component } from './react';
import ReactDOM from './react-dom';

// import React, { Component } from 'react';
// import ReactDOM from 'react-dom';

class App extends Component {
  state = {
    number: 1,
  };
  handleClick = e => {
    this.setState({
      number: this.state.number + 1,
    });
    this.setState({
      number: this.state.number + 1,
    });
  };

  shouldComponentUpdate(nextProps, nextState) {
    return true;
  }

  render() {
    return (
      <div
        style={{ color: 'red' }}
        className="app"
        id={'id' + this.state.number}
      >
        {this.state.number}
        <button onClick={this.handleClick}>+</button>
      </div>
    );
  }
}

// const element = React.createElement('div', {}, '我是原生组件');

ReactDOM.render(<App />, document.getElementById('root'));
