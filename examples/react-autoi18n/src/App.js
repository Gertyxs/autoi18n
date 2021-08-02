import logo from './logo.svg';
import './App.css';
import { in8n, changeLang } from '~/i18n'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p aa={'豆腐干'} bb="asd是的法规">
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <h1>欢迎使用 autoi8n </h1>
        <select onChange={changeLang}>
          <option value="cn-us">中文</option>
          <option value="zh-en">英文</option>
        </select>
      </header>
    </div>
  );
}

export default App;

