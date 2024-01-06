import React from "react";
import { connect } from "react-redux";
import { RootState } from "../../../redux/store";
import { createScheduleRequest, deleteScheduleRequest, updateScheduleRequest } from "../../../redux/actions";
import {
    selectDeleteScheduleLoading,
    selectSchedulesLoading,
    selectUpdateScheduleLoading,
} from "../../../redux/selectors";
import { Schedule, ScheduleType, WeekDay } from "../../../Schema";
import { ThunkDispatch } from "@reduxjs/toolkit";
import {
    Row,
    Tabs,
    Button,
    message,
    Popconfirm,
    Modal,
    Table,
    Tag,
    Divider,
    Col,
    DatePicker,
    Switch,
} from "antd";
import { Content } from "antd/es/layout/layout";
import dayjs from "dayjs";
import updateLocale from "dayjs/plugin/updateLocale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import withAuthorization from "../../../HOC/withAuthorization";
import "./index.css";
import WeekdaySelector from "./components/WeekdaySelector";

const { Column } = Table;

dayjs.extend(updateLocale);
dayjs.updateLocale("en", {
    weekStart: 1,
});

interface IScheduleState {
    localSchedule: Schedule[];
    selectedDays: WeekDay[];
    visible: boolean;
    timeFrom: string;
    timeTo: string;
    active: boolean;
    internally: boolean;
    editId: string;
}

interface IScheduleProps {
    loading: boolean;
    schedules: Schedule[];
    updateScheduleLoading: boolean;
    deleteScheduleLoading: boolean;
    calendarId: string;
    updateScheduleRequest: (id: string, schedule: Schedule) => Promise<any>;
    deleteScheduleRequest: (id: string) => Promise<any>;
    createScheduleRequest: (schedule: Schedule) => Promise<any>;
    onDeleteSchedule: () => void;
}

class SchedulePage extends React.Component<IScheduleProps, IScheduleState> {
    constructor(props: IScheduleProps) {
        super(props);
        this.state = {
            localSchedule: props.schedules,
            selectedDays: [],
            visible: false,
            timeFrom: '',
            timeTo: '',
            active: true,
            internally: false,
            editId: '',
        };
    }
    componentDidUpdate(prevProps: Readonly<IScheduleProps>): void {
        if (prevProps.schedules !== this.props.schedules) {
            this.setState({
                localSchedule: this.props.schedules,
            });
        }
    }

    renderWorkingHours = () => {
        const { localSchedule, selectedDays, visible, timeFrom, timeTo, internally, active, editId } = this.state;

        const resetState = () => {
            this.setState({ selectedDays: [], timeFrom: '', timeTo: '', internally: false, active: true, editId: '' })
        }
        const onOpen = () => {
            this.setState({ visible: true })
        }

        const onClose = () => {
            this.setState({ visible: false })
            resetState();
        }

        const onSave = async () => {
            this.setState({ visible: false });

            if(editId){
                const schedule = this.props.schedules.filter(el => el._id === editId)[0];
                const newSchedule = Object.assign({}, schedule)
                delete newSchedule._id;
                delete newSchedule.createdAt;
                delete newSchedule.updatedAt;

                this.props.updateScheduleRequest(editId, {
                    ...newSchedule,
                    weekday: selectedDays[0],
                    time_from: timeFrom,
                    time_to: timeTo,
                    only_internally: internally,
                    active
                }).then((data) => {
                    if(data._id) {
                        message.success('Successfully updated the schedule');
                    } else {
                        message.error('Something went wrong. please try again')
                    }
                })
            } else {
            const schedules = selectedDays.map((weekday) => ({
                calendar_id: this.props.calendarId,
                working_hours_type: ScheduleType.Weekly,
                weekday: weekday,
                time_from: timeFrom,
                time_to: timeTo,
                only_internally: internally,
                active: active,
            }));

            await Promise.all(schedules.map(this.props.createScheduleRequest))
            }
            resetState();
        }

        const onDeleteSchedule = (id: string) => {
            this.props.deleteScheduleRequest(id).then(data => {
                if (data.status && data.status === "success") {
                    message.success('Successfully deleted the schedule')
                } else {
                    message.error('Something went wrong. please try again')
                }
            })
        };

        const onEditSchedule = (schedule: Schedule) => {
            this.setState({
                visible: true,
                editId: schedule._id!,
                active: Boolean(schedule.active),
                internally: Boolean(schedule.only_internally),
                timeFrom: schedule.time_from,
                timeTo: schedule.time_to,
                selectedDays: [schedule.weekday!]
            })
        };



        const handleSelectedDaysChange = (selectedDays: WeekDay[]) => {
            this.setState({ selectedDays })
        };

        return (
            <div>
                {visible ? <Modal
                    title="New Schedule"
                    open={visible}
                    centered
                    closable={false}
                    onCancel={onClose}
                    onOk={onSave}
                    width={850}
                >
                    <Divider />
                    <div>
                        <p>Select Weekdays</p>
                        <WeekdaySelector selectedDays={this.state.selectedDays} setSelectedDays={handleSelectedDaysChange} disabled={Boolean(editId)} />
                    </div>
                    <Row className="mb-6">
                        <Col span={8} className="w-full">
                            <span>Time from</span>
                        </Col>
                        <Col span={16}>
                            <DatePicker.TimePicker
                                onChange={(value) => {
                                    this.setState({ timeFrom: dayjs(value).format('hh:mm A') })
                                }}
                                format={'hh:mm A'}
                                value={timeFrom ? dayjs(timeFrom, 'hh:mm A') : null}
                            />
                        </Col>
                    </Row>
                    <Row className="mb-6">
                        <Col span={8} className="w-full">
                            <span>Time to</span>
                        </Col>
                        <Col span={16}>
                            <DatePicker.TimePicker
                                onChange={(value) => {
                                    this.setState({ timeTo: dayjs(value).format('hh:mm A') })
                                }}
                                format={'hh:mm A'}
                                value={timeTo ? dayjs(timeTo, 'hh:mm A') : null}
                            />
                        </Col>
                    </Row>
                    <Row className="mb-6" gutter={[16, 16]}>
                        <Col span={8} className="w-full">
                            <span>Working hours are active and bookable</span>
                        </Col>
                        <Col span={16}>
                            <Switch value={active} onChange={(value) => {
                                this.setState({ active: value })
                            }} />
                        </Col>
                    </Row>
                    <Row className="mb-6" gutter={[16, 16]}>
                        <Col span={8} className="w-full">
                            <span>Only bookable internally</span>
                        </Col>
                        <Col span={16}>
                            <Switch value={internally} onChange={(value) => {
                                this.setState({ internally: value })
                            }} />
                        </Col>
                    </Row>
                </Modal> : null}
                <Table
                    dataSource={localSchedule}
                    style={{ marginTop: 20 }}
                    rowKey="_id"
                    bordered
                    footer={() => {
                        return (
                            <Button onClick={onOpen}>New Schedule</Button>
                        )
                    }}
                >
                    <Column title="Active" dataIndex={"active"} render={(value) => (value ? <Tag color="green">Active</Tag> : <Tag color="red">Not Active</Tag>)} />
                    <Column title="Day" dataIndex={"weekday"} />
                    <Column title="Time of" dataIndex={"time_from"} />
                    <Column title="Time until" dataIndex={"time_to"} />
                    <Column title="SERVICES" dataIndex={"restricted_to_services"} render={(value) => (value.length ? <Tag>For some services</Tag> : <Tag>For all services</Tag>)} />
                    <Column
                        title="Action"
                        key="action"
                        render={(_: any, record: Schedule) => (
                            <Row>
                                <Popconfirm
                                    title="Delete this schedule?"
                                    description="Are you sure you want to delete this schedule?"
                                    okText="Delete It"
                                    cancelText="No"
                                    okButtonProps={{
                                        danger: true,
                                    }}
                                    onConfirm={() => onDeleteSchedule(record._id!)}
                                >
                                    <Button className="self-end mr-3" type="link">Delete</Button>
                                </Popconfirm>
                                <Button className="self-end mr-3" type="link" onClick={() => onEditSchedule(record)}>Edit</Button>
                            </Row>
                        )}
                    />
                </Table>
            </div>
        );
    };

    render() {
        return (
            <div>
                <Row gutter={[16, 16]}>
                    <Content>
                        <Tabs
                            defaultActiveKey="1"
                            items={[
                                {
                                    key: "1",
                                    label: "Working hours",
                                    children: this.renderWorkingHours(),
                                },
                                {
                                    key: "2",
                                    label: "Working hours (certain days) / One-time appointment",
                                    // children: this.renderAdvancedSettings(),
                                },
                            ]}
                        />
                    </Content>
                </Row>
            </div>
        );
    }
}

const mapStateToProps = (state: RootState) => ({
    loading: selectSchedulesLoading(state),
    updateScheduleLoading: selectUpdateScheduleLoading(state),
    deleteScheduleLoading: selectDeleteScheduleLoading(state)
});

const mapDispatchToProps = (
    dispatch: ThunkDispatch<RootState, undefined, any>
) => ({
    updateScheduleRequest: (id: string, schedule: Schedule) => dispatch(updateScheduleRequest(id, schedule)),
    deleteScheduleRequest: (id: string) => dispatch(deleteScheduleRequest(id)),
    createScheduleRequest: (schedule: Schedule) => dispatch(createScheduleRequest(schedule)),
});

// export default compose(
//     withAuthorization,
//   )(connect(mapStateToProps, mapDispatchToProps)(CalendarPage))

export default connect(mapStateToProps, mapDispatchToProps)(SchedulePage);
