import React from "react";
import { connect } from "react-redux";
import { RootState } from "../../../redux/store";
import { fetchCalendars, createCalendarRequest } from "../../../redux/actions";
import { selectCalendars, selectCalendarsLoading } from "../../../redux/selectors";
import { Calendar as CalendarType } from "../../../Schema";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { Button, Col, Empty, Popconfirm, Row, Select, message } from "antd";
import "react-big-calendar/lib/css/react-big-calendar.css";
import withAuthorization from "../../../HOC/withAuthorization";
import './index.css'
import Calendar from './calendar'
import { withTranslation } from 'react-i18next';
import i18n from "../../../locales/i18n";

const { Option } = Select;


interface ICalendarState {
    selectedCalendar: string;
    activeIndex: number;
}

interface ICalendarProps {
    loading: boolean;
    fetchCalendars: () => Promise<any>;
    createCalendarRequest: (calendar: CalendarType) => Promise<any>;
    calendars: CalendarType[];
}

class CalendarsPage extends React.Component<ICalendarProps, ICalendarState> {
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
                const value = `${res.data[0].employee_name} ${res.data[0].active ? '' : `(${i18n.t('not_activated')})`}`
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
            const value = `${calendars[0].employee_name} ${calendars[0].active ? '' : `(${i18n.t('not_activated')})`}`
            this.setState({ selectedCalendar: value, activeIndex: 0 })
        }
    }

    getHeader = (calendar: CalendarType, index: number) => (
        <span className="font-bold text-lg">{calendar.employee_name}</span>
    );

    onCreateCalendar = () => {
        const newCalendar: CalendarType = {
            employee_name: i18n.t('new_calendar'),
            active: true,
        };
        this.props.createCalendarRequest(newCalendar).then(data => {
            if (data._id) {
                message.success(i18n.t('successfully_created_the_calendar'));
                this.setState({ activeIndex: this.props.calendars.length - 1, selectedCalendar: data.employee_name })
            } else {
                message.error(i18n.t('something_went_wrong_please_try_again'));
            }
        })
    }

    render() {
        const { loading, calendars } = this.props;
        const { selectedCalendar, activeIndex } = this.state;

        if (loading) {
            return <div>{i18n.t('loading')}...</div>;
        }

        if(!calendars.length){
            return <Empty description={i18n.t('empty')}/>
        }

        return (
            <div className="w-full">
                <Row className="w-full" gutter={[16, 16]}>
                    <Col span={10}>
                        <Select className="w-full" value={selectedCalendar} onChange={(value, record) => {
                            this.onSelectCalendar(value, record)
                        }}>
                            {calendars.map((calendar, index) => {
                                const value = `${calendar.employee_name} ${calendar.active ? '' : `(${i18n.t('not_activated')})`}`
                                return (
                                    <Option key={index} value={value}>{value}</Option>
                                )
                            })}
                        </Select>
                    </Col>
                    <Col span={6}>
                        <Popconfirm
                            title={i18n.t('create_new_calendar')}
                            description={i18n.t('are_you_sure_you_want_to_create_new_calendar')}
                            okText={i18n.t('create_it')}
                            cancelText={i18n.t('no')}
                            onConfirm={this.onCreateCalendar}
                        >
                            <Button loading={false} className="mb-3" type="primary">{i18n.t('new_calendar')}</Button>
                        </Popconfirm>
                    </Col>
                </Row>

                {calendars.length ? <Calendar calendar={calendars[activeIndex]} onDeleteCalendar={this.onDeleteCalendar}/> : null}
            </div>
        );
    }
}


const mapStateToProps = (state: RootState) => ({
    calendars: selectCalendars(state),
    loading: selectCalendarsLoading(state),
});

const mapDispatchToProps = (
    dispatch: ThunkDispatch<RootState, undefined, any>
) => ({
    fetchCalendars: () => dispatch(fetchCalendars()),
    createCalendarRequest: (calendar: CalendarType) => dispatch(createCalendarRequest(calendar)),
});

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(withAuthorization(CalendarsPage)))
