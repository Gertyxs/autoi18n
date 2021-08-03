import logo from "./logo.svg";
import "./App.css";
import { changeLang } from "~/i18n";

function App() {
  const setLanguage = (e) => {
    changeLang(e.target.value)
  }
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
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
        <h1>欢迎使用 autoi18n</h1>
        <select onChange={setLanguage} value={window.localStorage.getItem("lang")}>
          <option value="zh-cn">中文</option>
          <option value="en-us">英文</option>
        </select>
      </header>
    </div>
  );
}

export default App;
