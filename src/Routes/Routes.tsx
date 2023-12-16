import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CategoryPage from '../pages/Category';
import CalendarPage from '../pages/Calendar';
import LoginPage from '../pages/Login';

class Router extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CategoryPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    );
  }
}

export default Router;
