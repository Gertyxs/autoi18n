import { i18n } from "~/i18n";
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
        <h1>{i18n.get("1457a8cf081b42e8461e210209b9661c")}</h1>
        <select onChange={setLanguage} value={window.localStorage.getItem("lang")}>
          <option value="zh-cn">{i18n.get('a7bac2239fcdcb3a067903d8077c4a07')}</option>
          <option value="en-us">{i18n.get('f9fb6a063d1856da86a06def2dc6b921')}</option>
        </select>
      </header>
    </div>
  );
}

export default App;
