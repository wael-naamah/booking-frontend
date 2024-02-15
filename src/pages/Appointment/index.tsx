import React from "react";
import { connect } from "react-redux";
import { RootState } from "../../redux/store";
import { fetchAppointments, fetchTimeSlots, fetchEmployees } from "../../redux/actions";
import { selectAppointments, selectAppointmentsLoading, selectEmployees, selectEmployeesLoading, selectTimeslots, selectTimeslotsLoading } from "../../redux/selectors";
import { AppointmentForm, TimeSlotsForm, Calendar as CalendarType, PaginatedForm, ExtendedAppointment } from "../../Schema";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { Row, Col, Card, Calendar, Spin, message } from "antd";
import { Calendar as BigCalendar, Views, momentLocalizer } from 'react-big-calendar';
import * as moment from 'moment';
import 'moment/locale/de'

import dayjs, { Dayjs } from 'dayjs';
import updateLocale from 'dayjs/plugin/updateLocale';
import { SelectInfo } from "antd/es/calendar/generateCalendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import withAuthorization from "../../HOC/withAuthorization";
import './index.css'
import AppointmentDetailsModal from "../../components/AppointmentDetailsModal";
import { withTranslation } from 'react-i18next';
import i18n from "../../locales/i18n";
import CreateAppointmentModal from "../../components/CreateAppointmentModal";

dayjs.extend(updateLocale)
dayjs.updateLocale('en', {
    weekStart: 1
})

interface CalendarEvent extends ExtendedAppointment {
    title: string;
    start: Date;
    end: Date;
}
interface IAppointmentState {
    currentDate: Dayjs | null;
    views: ['day', 'work_week'];
    selectedEvent: CalendarEvent | null;
    modalState: boolean;
    newAppointmentModal: boolean;
    selectedSlot: any
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
    appointments: ExtendedAppointment[];
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
            selectedEvent: null,
            modalState: false,
            newAppointmentModal: false,
            selectedSlot: null
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
        const midnightValue = value.endOf('day');

        if (selectInfo.source === 'date') {
            this.setState({ currentDate: midnightValue })
        }
    };

    formatTime = (time: string) => {
        const date = new Date(time);
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    componentDidUpdate(prevProps: IAppointmentProps, prevState: IAppointmentState) {
        const { currentDate } = this.state;
        if (prevState.currentDate !== currentDate) {
            this.fetchTimeslots();
        }
    }

    renderEventModal = () => {
        const firstDateOfMonth = dayjs().startOf('month');
        const lastDateOfMonth = dayjs().endOf('month');
        const { selectedEvent, modalState } = this.state;
        const onClose = () => {
            this.setState({ modalState: false, selectedEvent: null })
        }

        const onSave = () => {
            this.props.fetchAppointments({ start: firstDateOfMonth.toISOString(), end: lastDateOfMonth.toISOString() });
            this.setState({ modalState: false, selectedEvent: null });
        };

        return <AppointmentDetailsModal selectedEvent={selectedEvent} visible={modalState} onClose={onClose} onSave={onSave} calendars={this.props.employees} />
    }

    renderNewAppointmentModal = () => {
        const firstDateOfMonth = dayjs().startOf('month');
        const lastDateOfMonth = dayjs().endOf('month');
        const { selectedSlot, newAppointmentModal } = this.state;
        const onClose = () => {
            this.setState({ newAppointmentModal: false, selectedSlot: null })
        }

        const onSave = () => {
            this.props.fetchAppointments({ start: firstDateOfMonth.toISOString(), end: lastDateOfMonth.toISOString() });
            this.setState({ newAppointmentModal: false, selectedSlot: null });
        };

        return <CreateAppointmentModal selectedSlot={selectedSlot} visible={newAppointmentModal} onClose={onClose} onSave={onSave} calendars={this.props.employees} />
    }


    render() {
        const { loading, timeslots, timeslotsLoading, appointments, employees } = this.props;
        const { currentDate, views, modalState, newAppointmentModal } = this.state;
        const localizer = momentLocalizer(moment);

        const resourceMap = (employees || []).map(el => ({
            resourceId: el._id,
            resourceTitle: el.employee_name
        }))

        const events = (appointments || []).map((el, index) => {
            const startUTC = new Date(el.start_date);
            const endUTC = new Date(el.end_date);

            const start = new Date(startUTC.getTime() + startUTC.getTimezoneOffset() * 60000);
            const end = new Date(endUTC.getTime() + endUTC.getTimezoneOffset() * 60000);

            return {
                title: el.service?.name || '',
                start,
                end,
                resourceId: el.calendar_id,
                service: undefined,
                ...el
            };
        });


        const handleSelectedEvent = async (event: CalendarEvent) => {
            this.setState({
                selectedEvent: event,
                modalState: true,
            })
        }

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
            return <div>{i18n.t('loading')}...</div>;
        }

        return (
            <>
                {modalState ? this.renderEventModal() : null}
                {newAppointmentModal ? this.renderNewAppointmentModal() : null}
                <Row gutter={16} justify={'space-around'} className="calendar-container">
                    <Col span={6} xs={24} md={6}>
                        <Card className="calendar-card">
                            <Calendar
                                fullscreen={false}
                                value={currentDate ? currentDate : dayjs()}
                                onSelect={this.onSelectDate}
                                onChange={(date) => this.setState({ currentDate: dayjs(date) })}
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
                                culture={i18n.language}
                                localizer={localizer}
                                resourceIdAccessor="resourceId"
                                resources={resourceMap}
                                resourceTitleAccessor="resourceTitle"
                                step={60}
                                selectable
                                onSelectSlot={(slot) => {
                                    const currentDate = new Date();
                                    if (slot.start < currentDate) {
                                        message.error(i18n.t('book_appointment_in_past_error'))
                                    } else {
                                        this.setState({
                                            selectedSlot: slot,
                                            newAppointmentModal: true
                                        })
                                    }
                                }}
                                views={views}
                                popup={true}
                                onSelectEvent={(e) => handleSelectedEvent(e)}
                                messages={{
                                    next: i18n.t('next'),
                                    previous: i18n.t('previous'),
                                    today: i18n.t('today'),
                                    month: i18n.t('month'),
                                    week: i18n.t('week'),
                                    day: i18n.t('day'),
                                    work_week: i18n.t('work_week'),
                                    allDay: i18n.t('all_day'),
                                    yesterday: i18n.t('yesterday'),
                                    tomorrow: i18n.t('tomorrow'),
                                    noEventsInRange: i18n.t('no_events_in_range'),
                                    showMore: function showMore(total) {
                                        return '+' + total + i18n.t('events');
                                    }
                                }}
                            />
                        </div>
                    </Col>
                </Row>
            </>
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


export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(withAuthorization(AppointmentPage)))
