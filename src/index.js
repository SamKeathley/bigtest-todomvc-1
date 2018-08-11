import React from 'react'
import { render } from 'react-dom'
import TodoMVC from './components/TodoMVC'
import './style.css';

let key = 'microstates-todomvc';

let restore = () => JSON.parse(localStorage.getItem(key) || "null");
let save = value => localStorage.setItem(key, JSON.stringify(value));

let initial = restore() || {
  todos: [{ id: 0, text: 'Write Microstates Docs', completed: false }]
};

if (process.env.NODE_ENV !== 'production') {
  const {whyDidYouUpdate} = require('why-did-you-update');
  whyDidYouUpdate(React);
}

render(<TodoMVC value={initial} onChange={save} />, document.getElementById('root'))
