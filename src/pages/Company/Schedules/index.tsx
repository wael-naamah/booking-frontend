import React from "react";
import { connect } from "react-redux";
import { RootState } from "../../../redux/store";
import { fetchSchedulesByCalendarId, fetchCalendars } from "../../../redux/actions";
import { selectCalendars, selectCalendarsLoading, selectSchedules, selectSchedulesLoading } from "../../../redux/selectors";
import { Schedule, Calendar } from "../../../Schema";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { Col, Empty, Row, Select, Spin } from "antd";
import "react-big-calendar/lib/css/react-big-calendar.css";
import withAuthorization from "../../../HOC/withAuthorization";
import './index.css'
import SchedulePage from './schedule'

const { Option } = Select;


interface ICalendarState {
    selectedCalendar: string;
    activeIndex: number;
}

interface ICalendarProps {
    schedules: Schedule[];
    loading: boolean;
    calendars: Calendar[];
    calendarsLoading: boolean;
    fetchSchedulesByCalendarId: (calendarId: string) => Promise<any>;
    fetchCalendars: () => Promise<any>;
}

class ServicesPage extends React.Component<ICalendarProps, ICalendarState> {
    constructor(props: ICalendarProps) {
        super(props);
        this.state = {
            selectedCalendar: '',
            activeIndex: 0,
        };
    }

    componentDidMount() {
        this.props.fetchCalendars().then((res) => {
            if (res?.data && res.data.length) {
                const value = `${res.data[0].employee_name} ${res.data[0].active ? '' : '(not activated)'}`
                this.setState({ selectedCalendar: value })
                this.props.fetchSchedulesByCalendarId(res.data[0]._id)
            }
        });
    }

    onSelectCalendar = (value: any, record: any) => {
        const { calendars } = this.props;

        this.setState({ selectedCalendar: value, activeIndex: record.key })
        this.props.fetchSchedulesByCalendarId(calendars[record.key]._id!)
    }

    onDeleteSchedule = () => {
        const { calendars } = this.props;

        if (this.props.calendars.length) {
            const value = `${calendars[0].employee_name} ${calendars[0].active ? '' : '(not activated)'}`
            this.setState({ selectedCalendar: value, activeIndex: 0 })
        }
    }

    getHeader = (calendar: Calendar, index: number) => (
        <span className="font-bold text-lg">{calendar.employee_name}</span>
    );

    render() {
        const { loading, calendars, calendarsLoading, schedules } = this.props;
        const { selectedCalendar, activeIndex } = this.state;

        if (calendarsLoading) {
            return <div>loading...</div>;
        }

        if (!calendars.length) {
            return <Empty />
        }

        return (
            <div className="w-full">
                <Row className="w-full" gutter={[16, 16]}>
                    <Col span={10}>
                        <Select className="w-full" value={selectedCalendar} onChange={(value, record) => {
                            this.onSelectCalendar(value, record)
                        }}>
                            {calendars.map((calendar, index) => {
                                const value = `${calendar.employee_name} ${calendar.active ? '' : '(not activated)'}`
                                return (
                                    <Option key={index} value={value}>{value}</Option>
                                )
                            })}
                        </Select>
                    </Col>
                </Row>

                <Spin spinning={loading}>
                    <SchedulePage schedules={schedules} calendarId={calendars.length ? calendars[activeIndex]._id! : ''} onDeleteSchedule={this.onDeleteSchedule} />
                </Spin>
            </div>
        );
    }
}


const mapStateToProps = (state: RootState) => ({
    schedules: selectSchedules(state),
    loading: selectSchedulesLoading(state),
    calendars: selectCalendars(state),
    calendarsLoading: selectCalendarsLoading(state),
});

const mapDispatchToProps = (
    dispatch: ThunkDispatch<RootState, undefined, any>
) => ({
    fetchSchedulesByCalendarId: (id: string) => dispatch(fetchSchedulesByCalendarId(id)),
    fetchCalendars: () => dispatch(fetchCalendars()),
});

// export default compose(
//     withAuthorization,
//   )(connect(mapStateToProps, mapDispatchToProps)(ServicesPage))

export default connect(mapStateToProps, mapDispatchToProps)(ServicesPage)
