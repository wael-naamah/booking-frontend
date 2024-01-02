import React from "react";
import { connect } from "react-redux";
import { RootState } from "../../../redux/store";
import { fetchSchedulesByCalendarId, fetchCalendars } from "../../../redux/actions";
import { selectCalendars, selectCalendarsLoading, selectSchedules, selectSchedulesLoading } from "../../../redux/selectors";
import { Schedule, Calendar } from "../../../Schema";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { Button, Col, Collapse, Empty, Popconfirm, Row, Select, message } from "antd";
import "react-big-calendar/lib/css/react-big-calendar.css";
import withAuthorization from "../../../HOC/withAuthorization";
import './index.css'
import SchedulePage from './schedule'

const { Panel } = Collapse;
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
            }
        });
    }

    onSelectCalendar = (value: any, record: any) => {
        this.setState({ selectedCalendar: value, activeIndex: record.key })
    }

    onDeleteCalendar = () => {
        const { calendars } = this.props;

        if (this.props.calendars.length) {
            const value = `${calendars[0].employee_name} ${calendars[0].active ? '' : '(not activated)'}`
            this.setState({ selectedCalendar: value, activeIndex: 0 })
        }
    }

    getHeader = (calendar: Calendar, index: number) => (
        <span className="font-bold text-lg">{calendar.employee_name}</span>
    );

    onCreateCalendar = () => {
        const newCalendar: Calendar = {
            employee_name: "New Schedule",
            active: true,
        };
        // this.props.createCalendarRequest(newCalendar).then(data => {
        //     if (data._id) {
        //         message.success('Successfully created the calendar');
        //         // this.setState({ activeIndex: this.props.calendars.length - 1, selectedCalendar: data.employee_name })
        //     } else {
        //         message.error('Something went wrong. please try again');
        //     }
        // })
    }

    render() {
        const { loading, calendars, calendarsLoading, schedules } = this.props;
        const { selectedCalendar, activeIndex } = this.state;

        if (calendarsLoading) {
            return <div>loading...</div>;
        }

        if(!calendars.length){
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
                    <Col span={6}>
                        <Popconfirm
                            title="create new Schedule?"
                            description="Are you sure you want to create new schedule?"
                            okText="Create It"
                            cancelText="No"
                            onConfirm={this.onCreateCalendar}
                        >
                            <Button loading={false} className="mb-3" type="primary">New Schedules</Button>
                        </Popconfirm>
                    </Col>
                </Row>

                {schedules.length ? <SchedulePage calendar={calendars[activeIndex]} onDeleteCalendar={this.onDeleteCalendar}/> : null}
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
