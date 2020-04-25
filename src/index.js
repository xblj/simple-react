import React from './react';
import ReactDOM from './react-dom';

// import React from 'react';
// import ReactDOM from 'react-dom';
let index = 0;
class Todos extends React.Component {
  constructor(props) {
    super(props);
    this.state = { list: [], text: '' };
  }
  add = () => {
    if (this.state.text && this.state.text.length > 0) {
      this.setState({
        list: [
          ...this.state.list,
          {
            content: this.state.text,
            key: index++,
          },
        ],
      });
    }
  };
  onChange = event => {
    event.persist();
    console.log(event.target.value);

    if (event.keyCode === 13) {
      this.add();
    } else {
      this.setState({ text: event.target.value });
    }
  };
  onDel = index => {
    this.state.list.splice(index, 1);
    this.setState({ list: this.state.list });
  };
  render() {
    return (
      <div>
        <div>
          <input onKeyUp={this.onChange} value={this.state.text} />
          <button onClick={this.add}>add</button>
        </div>
        <ul>
          {this.state.list.map((item, index) => {
            return (
              <li>
                {item.content}
                <input />
                <button onClick={() => this.onDel(index)}>X</button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}
let element = React.createElement(Todos, {});
ReactDOM.render(element, document.getElementById('root'));
