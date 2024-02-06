import React, { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import store from "./redux/store";
import { BrowserRouter } from 'react-router-dom';
import './locales/i18n';
import Router from "./Routes/Routes";
import { startUp, startUpDone } from "./redux/actions";

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(startUp());
    let profile = null;
    const res = localStorage.getItem('profile');
    if(res){
      profile = JSON.parse(res)
    }

   dispatch(startUpDone(profile));
  }, [])
  
  return (
    <Router />
  );
}


function Container() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <div className="App">
          <App />
        </div>
      </BrowserRouter>
    </Provider>
  );
}

export default Container;
