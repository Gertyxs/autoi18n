import logo from './logo.svg';
import './App.css';
import { useTranslation } from "react-i18next"

function App() {
  const { i18n } = useTranslation()
  const setLanguage = (e) => {
    return i18n.changeLanguage(e.target.value)
  }
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
        <select onChange={setLanguage}>
          <option value="cn">中文</option>
          <option value="en">英文</option>
        </select>
      </header>
    </div>
  );
}

export default App;
