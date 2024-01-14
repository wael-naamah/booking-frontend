import React from "react";
import { connect } from "react-redux";
import { RootState } from "../../redux/store";
import { fetchAppointments, fetchTimeSlots, fetchEmployees } from "../../redux/actions";
import { selectAppointments, selectAppointmentsLoading, selectEmployees, selectEmployeesLoading, selectTimeslots, selectTimeslotsLoading } from "../../redux/selectors";
import { Appointment, AppointmentForm, TimeSlotsForm, Calendar as CalendarType, PaginatedForm } from "../../Schema";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { Row, Col, Card, Calendar, Spin } from "antd";
import { Calendar as BigCalendar, Views, momentLocalizer } from 'react-big-calendar';
import * as moment from 'moment';
import { compose } from 'redux'

import dayjs, { Dayjs } from 'dayjs';
import updateLocale from 'dayjs/plugin/updateLocale';
import { SelectInfo } from "antd/es/calendar/generateCalendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import withAuthorization from "../../HOC/withAuthorization";
import './index.css'

dayjs.extend(updateLocale)
dayjs.updateLocale('en', {
    weekStart: 1
})

interface IAppointmentState {
    currentDate: Dayjs | null;
    views: ['day', 'work_week'];
}

interface IAppointmentProps {
    loading: boolean;
    timeslots: {
        start: string;
        end: string;
        calendar_id: string;
        employee_name: string;
    }[];
    timeslotsLoading: boolean;
    fetchAppointments: (form: AppointmentForm) => Promise<any>;
    fetchTimeSlots: (form: TimeSlotsForm) => Promise<any>;
    appointments: Appointment[];
    employees: CalendarType[];
    employeesLoading: boolean;
    fetchEmployees: (form: PaginatedForm) => Promise<any>;
}

class AppointmentPage extends React.Component<IAppointmentProps, IAppointmentState> {
    constructor(props: IAppointmentProps) {
        super(props);
        this.state = {
            currentDate: dayjs(),
            views: ['day', 'work_week'],
        };
    }


    componentDidMount() {
        const firstDateOfMonth = dayjs().startOf('month');
        const lastDateOfMonth = dayjs().endOf('month');

        this.props.fetchAppointments({ start: firstDateOfMonth.toISOString(), end: lastDateOfMonth.toISOString() });
        this.props.fetchEmployees({ page: 1, limit: 100 });
        this.fetchTimeslots();
    }

    fetchTimeslots = async () => {
        const { currentDate } = this.state;
        try {
            if (currentDate)
                this.props.fetchTimeSlots({ date: currentDate.toISOString() })
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    onSelectDate = (value: Dayjs, selectInfo: SelectInfo) => {
        if (selectInfo.source === 'date') {
            this.setState({ currentDate: value })
        }
    };

    formatTime = (time: string) => {
        const date = new Date(time);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    componentDidUpdate(prevProps: IAppointmentProps, prevState: IAppointmentState) {
        const { currentDate } = this.state;
        if (prevState.currentDate !== currentDate) {
            this.fetchTimeslots();
        }
    }

    render() {
        const { loading, timeslots, timeslotsLoading, appointments, employees } = this.props;
        const { currentDate, views } = this.state;
        const localizer = momentLocalizer(moment);

        const resourceMap = (employees || []).map(el => ({
            resourceId: el._id,
            resourceTitle: el.employee_name
        }))

        const events = (appointments || []).map((el, index) => ({
            id: index,
            title: el.calendar_id,
            start: new Date(el.start_date),
            end: new Date(el.end_date),
            resourceId: el.calendar_id
        }))

        const formattedSlots: { slot: string, calendar_id: string, employee_name: string }[] = [...timeslots]
            .sort((a, b) => a.start.localeCompare(b.start))
            .reduce((result: { slot: string, calendar_id: string, employee_name: string }[], slot) => {
                const formattedStart = this.formatTime(slot.start);
                const formattedEnd = this.formatTime(slot.end);
                const formattedSlot = `${formattedStart} - ${formattedEnd}`;
                const slots: string[] = []

                // Add to result if not already present
                if (!slots.includes(formattedSlot)) {
                    slots.push(formattedSlot);
                    result.push({ slot: formattedSlot, calendar_id: slot.calendar_id, employee_name: slot.employee_name })
                }

                return result;
            }, []);

        if (loading) {
            return <div>loading...</div>;
        }

        return (
                <Row gutter={16} justify={'space-around'} className="calendar-container">
                    <Col span={6} xs={24} md={6}>
                            <Card className="calendar-card">
                                <Calendar
                                    fullscreen={false}
                                    value={currentDate ? currentDate : dayjs()}
                                    onSelect={this.onSelectDate}
                                />
                            </Card>
                            <Spin spinning={timeslotsLoading}>
                                <Card title={currentDate ? dayjs(currentDate).format('dddd DD-MM-YYYY') : ""} className="w-full h-96 mt-4 rounded-md overflow-y-auto">
                                    {formattedSlots.map((el) => (
                                        <div className="p-4 m-3 flex items-center justify-around border border-gray-300 rounded-md bg-gray-100">
                                            <span>{el.slot}</span>
                                            <span>{el.employee_name}</span>
                                        </div>
                                    ))}
                                </Card>
                            </Spin>
                    </Col>
                    <Col span={18} xs={24} md={18}>
                        <div style={{ height: 600 }}>
                            <BigCalendar
                                defaultView={Views.DAY}
                                date={currentDate ? dayjs(currentDate).toDate() : new Date()}
                                events={events}
                                localizer={localizer}
                                resourceIdAccessor="resourceId"
                                resources={resourceMap}
                                resourceTitleAccessor="resourceTitle"
                                step={60}
                                views={views}
                            />
                        </div>
                    </Col>
                </Row>
        );
    }
}

const mapStateToProps = (state: RootState) => ({
    appointments: selectAppointments(state),
    loading: selectAppointmentsLoading(state),
    timeslots: selectTimeslots(state),
    timeslotsLoading: selectTimeslotsLoading(state),
    employees: selectEmployees(state),
    employeesLoading: selectEmployeesLoading(state),
});

const mapDispatchToProps = (
    dispatch: ThunkDispatch<RootState, undefined, any>
) => ({
    fetchAppointments: (form: AppointmentForm) => dispatch(fetchAppointments(form)),
    fetchTimeSlots: (form: TimeSlotsForm) => dispatch(fetchTimeSlots(form.date, form.category_id, form.service_id)),
    fetchEmployees: (form: PaginatedForm) => dispatch(fetchEmployees(form)),
});

// export default compose(
//     withAuthorization,
//   )(connect(mapStateToProps, mapDispatchToProps)(AppointmentPage))

  export default connect(mapStateToProps, mapDispatchToProps)(AppointmentPage)
  