import React from "react";
import { connect } from "react-redux";
import { RootState } from "../../../redux/store";
import { updateCalendarRequest, deleteCalendarRequest } from "../../../redux/actions";
import {
    selectCalendars,
    selectCalendarsLoading,
    selectDeleteCalendarLoading,
    selectUpdateCalendarLoading,
} from "../../../redux/selectors";
import { AppointmentCluster, AppointmentDuration, AppointmentScheduling, AssignmentOfServices, Calendar, CalendarType, DescriptionDisplayType, Service } from "../../../Schema";
import { ThunkDispatch } from "@reduxjs/toolkit";
import {
    Row,
    Col,
    Tabs,
    Switch,
    Input,
    Select,
    Button,
    message,
    Popconfirm,
    Empty,
} from "antd";
import { Content } from "antd/es/layout/layout";
import dayjs from "dayjs";
import updateLocale from "dayjs/plugin/updateLocale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import withAuthorization from "../../../HOC/withAuthorization";
import "./index.css";

const { TextArea } = Input;
const { Option } = Select;

dayjs.extend(updateLocale);
dayjs.updateLocale("en", {
    weekStart: 1,
});

interface ICalendarState {
    editingTitle: number | null;
    localCalendar: Calendar;
    visible: boolean;
    newService: Service;
}

interface ICalendarProps {
    loading: boolean;
    calendar: Calendar;
    updateCalendarLoading: boolean;
    deleteCalendarLoading: boolean;
    updateCalendarRequest: (id: string, calendar: Calendar) => Promise<any>;
    deleteCalendarRequest: (id: string) => Promise<any>;
    onDeleteCalendar: () => void;
}

class CalendarPage extends React.Component<ICalendarProps, ICalendarState> {
    constructor(props: ICalendarProps) {
        super(props);
        this.state = {
            editingTitle: null,
            localCalendar: props.calendar,
            visible: false,
            newService: {
                name: '',
                description: '',
                duration: 60,
                price: 0,
                abbreviation_id: Math.floor(1000 + Math.random() * 9000)
            },
        };
    }
    componentDidUpdate(prevProps: Readonly<ICalendarProps>): void {
        if (prevProps.calendar !== this.props.calendar) {
            this.setState({
                localCalendar: this.props.calendar,
            });
        }
    }
    onUpdateCalendar = () => {
        const { localCalendar } = this.state;
        const updateCalendar = Object.assign({}, localCalendar);

        delete updateCalendar._id;
        delete updateCalendar.createdAt;
        delete updateCalendar.updatedAt;

        this.props.updateCalendarRequest(localCalendar._id!, updateCalendar).then(data => {
            if (data._id) {
                message.success('Successfully updated the calendar')
            } else {
                message.error('Something went wrong. please try again')
            }
        })
    };

    onDeleteCalendar = () => {
        const { localCalendar } = this.state;

        this.props.deleteCalendarRequest(localCalendar._id!).then(data => {
            if (data.status && data.status === "success") {
                message.success('Successfully deleted the calendar')
                this.props.onDeleteCalendar();
            } else {
                message.error('Something went wrong. please try again')
            }
        })
    };

    renderServices = () => {
        const { localCalendar } = this.state;

        const onChange = (key: string, value: boolean | string | number) => {
            this.setState({
                localCalendar: {
                    ...localCalendar,
                    [key]: value
                }
            })
        };

        return (
            <div>
                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>Show description on booking page</span>
                    </Col>
                    <Col span={16}>
                        <Select onChange={(value) => {
                            onChange('assignment_of_services', value)
                        }}
                            value={localCalendar.assignment_of_services} className="w-full">
                            {[
                                { lable: "All services are bookable", value: AssignmentOfServices.ALL },
                                { lable: "Certain services can be booked", value: AssignmentOfServices.CERTAIN },
                            ].map((el) => (
                                <Option key={el.lable} value={el.value}>
                                    {el.lable}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
            </div>
        );
    };

    renderAdvancedSettings = () => {
        const { localCalendar } = this.state;

        const onAdvancedSettingsChange = (key: string, value: boolean | string) => {
            this.setState({
                localCalendar: {
                    ...localCalendar,
                    advanced_settings: {
                        ...localCalendar.advanced_settings,
                        [key]: value
                    }
                }
            })
        };

        return (
            <div className="w-full">
                <Row className="mb-6" gutter={[16, 16]}>
                    <Col span={8} className="w-full">
                        <span>Multiple occupancy calendar</span>
                    </Col>
                    <Col span={16}>
                        <Switch value={localCalendar.advanced_settings?.multiple_occupanc} onChange={(value) => {
                            onAdvancedSettingsChange('multiple_occupanc', value)
                        }} />
                    </Col>
                </Row>

                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>E-mail notification to employees</span>
                    </Col>
                    <Col span={16}>
                        <Input
                            onChange={(e) => {
                                onAdvancedSettingsChange('notification_email', e.target.value)
                            }}
                            value={localCalendar.advanced_settings?.notification_email} />
                    </Col>
                </Row>
                <Row className="mb-6" gutter={[16, 16]}>
                    <Col span={8} className="w-full">
                        <span>Also use e-mail notification address as sender address</span>
                    </Col>
                    <Col span={16}>
                        <Switch value={localCalendar.advanced_settings?.notification_email_as_sender} onChange={(value) => {
                            onAdvancedSettingsChange('notification_email_as_sender', value)
                        }} />
                    </Col>
                </Row>
                <Row className="mb-6" gutter={[16, 16]}>
                    <Col span={8} className="w-full">
                        <span>SMS notification to employees</span>
                    </Col>
                    <Col span={16}>
                        <Switch value={localCalendar.advanced_settings?.sms_notification} onChange={(value) => {
                            onAdvancedSettingsChange('sms_notification', value)
                        }} />
                    </Col>
                </Row>

                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>E-mail manual appointment confirmation</span>
                    </Col>
                    <Col span={16}>
                        <Input
                            onChange={(e) => {
                                onAdvancedSettingsChange('manual_email_confirmation', e.target.value)
                            }}
                            value={localCalendar.advanced_settings?.manual_email_confirmation} />
                    </Col>
                </Row>

                <Row className="mb-6" gutter={[16, 16]}>
                    <Col span={8} className="w-full">
                        <span>Manual appointment confirmation for manually booked appointments</span>
                    </Col>
                    <Col span={16}>
                        <Switch value={localCalendar.advanced_settings?.manually_confirmation_for_manually_booked_appointments} onChange={(value) => {
                            onAdvancedSettingsChange('manually_confirmation_for_manually_booked_appointments', value)
                        }} />
                    </Col>
                </Row>

                <Row className="mb-6" gutter={[16, 16]}>
                    <Col span={8} className="w-full">
                        <span>Limitation to a maximum appointment duration</span>
                    </Col>
                    <Col span={16}>
                        <Switch value={localCalendar.advanced_settings?.limit_maximum_appointment_duration} onChange={(value) => {
                            onAdvancedSettingsChange('limit_maximum_appointment_duration', value)
                        }} />
                    </Col>
                </Row>

                <Row className="mb-6" gutter={[16, 16]}>
                    <Col span={8} className="w-full">
                        <span>Calculate call/waiting number</span>
                    </Col>
                    <Col span={16}>
                        <Switch value={localCalendar.advanced_settings?.call_waiting_number} onChange={(value) => {
                            onAdvancedSettingsChange('call_waiting_number', value)
                        }} />
                    </Col>
                </Row>

                <Row className="mb-6" gutter={[16, 16]}>
                    <Col span={8} className="w-full">
                        <span>Free/standing times are within availability times</span>
                    </Col>
                    <Col span={16}>
                        <Switch value={localCalendar.advanced_settings?.within_availability_times} onChange={(value) => {
                            onAdvancedSettingsChange('within_availability_times', value)
                        }} />
                    </Col>
                </Row>

                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>Calendar group (booking page)</span>
                    </Col>
                    <Col span={16}>
                        <Input
                            onChange={(e) => {
                                onAdvancedSettingsChange('calendar_group', e.target.value)
                            }}
                            value={localCalendar.advanced_settings?.calendar_group} />
                    </Col>
                </Row>


                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>Calendar type</span>
                    </Col>
                    <Col span={16}>
                        <Select className="w-full" onChange={(value) => {
                            onAdvancedSettingsChange('calendar_type', value)
                        }} value={localCalendar.advanced_settings?.calendar_type}>
                            {Object.values(CalendarType).map((el) => (
                                <Option key={el} value={el}>
                                    {el}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                </Row>

                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>Appointment cluster</span>
                    </Col>
                    <Col span={16}>
                        <Select className="w-full" onChange={(value) => {
                            onAdvancedSettingsChange('appointment_cluster', value)
                        }} value={localCalendar.advanced_settings?.appointment_cluster}>
                            {Object.values(AppointmentCluster).map((el) => (
                                <Option key={el} value={el}>
                                    {el}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>Appointment timing</span>
                    </Col>
                    <Col span={16}>
                        <Select className="w-full" onChange={(value) => {
                            onAdvancedSettingsChange('appointment_duration', value)
                        }} value={localCalendar.advanced_settings?.appointment_duration}>
                            {Object.values(AppointmentDuration).map((el) => (
                                <Option key={el} value={el}>
                                    {el}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>Order calendar</span>
                    </Col>
                    <Col span={16}>
                        <Input
                            onChange={(e) => {
                                onAdvancedSettingsChange('calendar_order', e.target.value)
                            }}
                            type="number"
                            value={localCalendar.advanced_settings?.calendar_order} />
                    </Col>
                </Row>
                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>Appointment duration factor (%)</span>
                    </Col>
                    <Col span={16}>
                        <Input
                            onChange={(e) => {
                                onAdvancedSettingsChange('duration_factor', e.target.value)
                            }}
                            type="number"
                            value={localCalendar.advanced_settings?.duration_factor} />
                    </Col>
                </Row>
                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>Reference to third-party system</span>
                    </Col>
                    <Col span={16}>
                        <Input
                            onChange={(e) => {
                                onAdvancedSettingsChange('reference_system', e.target.value)
                            }}
                            value={localCalendar.advanced_settings?.reference_system} />
                    </Col>
                </Row>
                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>Calendar ID</span>
                    </Col>
                    <Col span={16}>
                        <Input
                            onChange={(e) => {
                                onAdvancedSettingsChange('calendar_id', e.target.value)
                            }}
                            type="number"
                            value={localCalendar.advanced_settings?.calendar_id} />
                    </Col>
                </Row>
            </div>
        );
    };


    renderGernal = () => {
        const { localCalendar } = this.state;

        const onChange = (key: string, value: boolean | string | number) => {
            this.setState({
                localCalendar: {
                    ...localCalendar,
                    [key]: value
                }
            })
        };

        return (
            <div className="w-full">
                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>Name of employee or resource</span>
                    </Col>
                    <Col span={16}>
                        <Input
                            onChange={(e) => {
                                onChange('employee_name', e.target.value)
                            }}
                            value={localCalendar.employee_name} />
                    </Col>
                </Row>

                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>Description</span>
                    </Col>
                    <Col span={16}>
                        <TextArea
                            onChange={(e) => {
                                onChange('description', e.target.value)
                            }}
                            value={localCalendar.description} />
                    </Col>
                </Row>

                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>Show description on booking page</span>
                    </Col>
                    <Col span={16}>
                        <Select onChange={(value) => {
                            onChange('show_description', value)
                        }}
                            value={localCalendar.show_description} className="w-full">
                            {[
                                { lable: "Don't show", value: DescriptionDisplayType.None },
                                { lable: "Show as text", value: DescriptionDisplayType.Text },
                                { lable: "Show as a tooltip", value: DescriptionDisplayType.Tooltip },
                            ].map((el) => (
                                <Option key={el.lable} value={el.value}>
                                    {el.lable}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>Appointment allocation clocking</span>
                    </Col>
                    <Col span={16}>
                        <Select onChange={(value) => {
                            onChange('appointment_scheduling', value)
                        }}
                            value={localCalendar.appointment_scheduling} className="w-full">
                            {Object.values(AppointmentScheduling).map((item) => (
                                <Option key={item} value={item}>
                                    {item}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
                {/* employee_image,  */}
                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>Employee / resource can be booked online and via appointment finder</span>
                    </Col>
                    <Col span={16}>
                        <Switch onChange={(value) => {
                            onChange('online_booked', value)
                        }}
                            checked={localCalendar.online_booked} />
                    </Col>
                </Row>
            </div>
        );
    };

    render() {
        const { updateCalendarLoading, deleteCalendarLoading } = this.props;
        const { localCalendar } = this.state;

        if (!localCalendar) {
            return (
                <Empty />
            )
        }

        return (
            <div>
                <Row gutter={[16, 16]}>
                    <Content>
                        <Tabs
                            defaultActiveKey="1"
                            items={[
                                {
                                    key: "1",
                                    label: "General",
                                    children: this.renderGernal(),
                                },
                                {
                                    key: "2",
                                    label: "Advanced settings",
                                    children: this.renderAdvancedSettings(),
                                },
                                {
                                    key: "3",
                                    label: "Assignment of services",
                                    children: this.renderServices(),
                                },
                            ]}
                        />
                    </Content>
                </Row>
                <Row justify={'end'}>
                    <Popconfirm
                        title="Delete this calendar?"
                        description="Are you sure you want to delete this calendar?"
                        okText="Delete It"
                        cancelText="No"
                        okButtonProps={{
                            danger: true,
                        }}
                        onConfirm={this.onDeleteCalendar}
                    >
                        <Button loading={deleteCalendarLoading} className="self-end mr-3" type="primary" danger>Delete Calendar</Button>

                    </Popconfirm>
                    <Button onClick={this.onUpdateCalendar} loading={updateCalendarLoading} className="self-end" type="primary">Save Changes</Button>
                </Row>
            </div>
        );
    }
}

const mapStateToProps = (state: RootState) => ({
    calendars: selectCalendars(state),
    loading: selectCalendarsLoading(state),
    updateCalendarLoading: selectUpdateCalendarLoading(state),
    deleteCalendarLoading: selectDeleteCalendarLoading(state)
});

const mapDispatchToProps = (
    dispatch: ThunkDispatch<RootState, undefined, any>
) => ({
    updateCalendarRequest: (id: string, calendar: Calendar) => dispatch(updateCalendarRequest(id, calendar)),
    deleteCalendarRequest: (id: string) => dispatch(deleteCalendarRequest(id)),
});

// export default compose(
//     withAuthorization,
//   )(connect(mapStateToProps, mapDispatchToProps)(CalendarPage))

export default connect(mapStateToProps, mapDispatchToProps)(CalendarPage);
