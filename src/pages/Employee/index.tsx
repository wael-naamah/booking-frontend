import React from "react";
import { connect } from "react-redux";
import { RootState } from "../../redux/store";
import { fetchCalendarAppointments } from "../../redux/actions";
import { selectCalendarAppointments, selectCalendarAppointmentsLoading, selectProfile } from "../../redux/selectors";
import { ExtendedAppointment } from "../../Schema";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { Row, Col, Spin } from "antd";
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import * as moment from 'moment';

import "react-big-calendar/lib/css/react-big-calendar.css";
import withAuthorization from "../../HOC/withAuthorization";
import './index.css';
import Header from "../../components/Header";
import { Content } from "antd/es/layout/layout";
import AppointmentDetailsModal from "../../components/AppointmentDetailsModal";


interface CalendarEvent extends ExtendedAppointment {
    title: string;
    start: Date;
    end: Date;
}

interface IEmployeeState {
    selectedEvent: CalendarEvent | null;
    modalState: boolean;
}

interface IEmployeeProps {
    loading: boolean;
    fetchCalendarAppointments: (id: string) => Promise<any>;
    appointments: ExtendedAppointment[];
    profile: any
}

class EmployeePage extends React.Component<IEmployeeProps, IEmployeeState> {
    constructor(props: IEmployeeProps) {
        super(props);
        this.state = {
            selectedEvent: null,
            modalState: false,
        };
    }


    componentDidMount() {
        if(this.props.profile?._id)
        this.props.fetchCalendarAppointments(this.props.profile?._id);
    }

    renderEventModal = () => {
        const { selectedEvent, modalState } = this.state;
        const onClose = () => {
            this.setState({ modalState: false, selectedEvent: null })
        }

        const onSave = () => {
            if(this.props.profile?._id)
            this.props.fetchCalendarAppointments(this.props.profile?._id);
            this.setState({ modalState: false, selectedEvent: null });
        };

        return <AppointmentDetailsModal selectedEvent={selectedEvent} visible={modalState} onClose={onClose} onSave={onSave} />
    }

    render() {
        const { loading, appointments } = this.props;
        const { modalState } = this.state;
        const localizer = momentLocalizer(moment);


        const events = (appointments || []).map((el) => ({
            title: el.service?.name || '',
            start: new Date(el.start_date),
            end: new Date(el.end_date),
            ...el
        }))

        const handleSelectedEvent = async (event: CalendarEvent) => {
            this.setState({
                selectedEvent: event,
                modalState: true,
            })
        }

        return (
            <Content>
                {modalState ? this.renderEventModal() : null}
                <Header />
                <Spin spinning={loading}>
                    <Row gutter={16} justify={'space-around'} className="calendar-container">
                        <Col span={24} xs={24} md={18}>
                            <div style={{ height: 600 }}>
                                <BigCalendar
                                    localizer={localizer}
                                    events={events}
                                    startAccessor="start"
                                    endAccessor="end"
                                    popup={true}
                                    onSelectEvent={(e) => handleSelectedEvent(e)}
                                />
                            </div>
                        </Col>
                    </Row>
                </Spin>
            </Content>
        );
    }
}

const mapStateToProps = (state: RootState) => ({
    appointments: selectCalendarAppointments(state),
    loading: selectCalendarAppointmentsLoading(state),
    profile: selectProfile(state),
});

const mapDispatchToProps = (
    dispatch: ThunkDispatch<RootState, undefined, any>
) => ({
    fetchCalendarAppointments: (id: string) => dispatch(fetchCalendarAppointments(id)),
});


export default connect(mapStateToProps, mapDispatchToProps)(withAuthorization(EmployeePage))
