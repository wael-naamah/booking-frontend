import React from "react";
import { Provider } from "react-redux";
import store from "./redux/store";
import Header from "./components/Header";
import Router from "./Routes/Routes";

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <Header />
        <Router />
      </div>
    </Provider>
  );
}

export default App;
