import React from 'react';
import { Route, Routes } from 'react-router-dom';
import CategoryPage from '../pages/Category';
import AppointmentPage from '../pages/Appointment';
import ServicesPage from '../pages/Company/Services';
import CalendarPage from '../pages/Company/Calendar';
import WorkingHoursPage from '../pages/Company/Schedules';
import LoginPage from '../pages/Login';
import SideBar from '../pages/SideBar';
import Contact from '../pages/Contact';

class Router extends React.Component {
  render() {
    return (
      <Routes>
      <Route path="/" element={<SideBar />}>
        <Route path="/category" element={<CategoryPage />} />
        <Route path="/appointment" element={<AppointmentPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/working-hours" element={<WorkingHoursPage />} />
        <Route path="/contact" element={<Contact />} />
      </Route>
      <Route path="/login" element={<LoginPage />} /> 
    </Routes>
    );
  }
}

export default Router;
