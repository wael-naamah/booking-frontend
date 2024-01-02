import React from "react";
import { Provider } from "react-redux";
import store from "./redux/store";
import { BrowserRouter } from 'react-router-dom';

import Router from "./Routes/Routes";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <div className="App">
          <Router />

        </div>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
