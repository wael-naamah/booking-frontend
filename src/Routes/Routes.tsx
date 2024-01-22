import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import CategoryPage from '../pages/Category';
import AppointmentPage from '../pages/Appointment';
import ServicesPage from '../pages/Company/Services';
import CalendarPage from '../pages/Company/Calendar';
import WorkingHoursPage from '../pages/Company/Schedules';
import LoginPage from '../pages/Login';
import SideBar from '../pages/SideBar';
import Contact from '../pages/Contact';
import ContactAppointments from '../pages/Contact/Appointments';
import Settings from '../pages/Settings';
import EmployeePage from '../pages/Employee';

class Router extends React.Component {
  render() {
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/appointment" replace />} />
        <Route path="/"
          element={<SideBar />}
        >
          <Route path="/appointment" element={<AppointmentPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/contact/appointments/:contactId" element={<ContactAppointments />} />
          <Route path="/working-hours" element={<WorkingHoursPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="/category" element={<CategoryPage />} />
        <Route path="/employee" element={<EmployeePage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    );
  }
}

export default Router;
