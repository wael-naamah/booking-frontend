import { Button, Checkbox, Col, DatePicker, Divider, Form, Input, List, Modal, Row, Select, Space, Spin, Tabs, Upload, message } from 'antd';
import React from 'react';
import { ThunkDispatch } from "@reduxjs/toolkit";
import { connect } from "react-redux";
import { Appointment, Attachment, Calendar, Contact, ExtendedAppointment } from '../Schema';
import { RootState } from '../redux/store';
import { selectUpdateAppointmentLoading } from '../redux/selectors';
import { fetchContactById, updateAppointmentRequest } from '../redux/actions';
import { FILES_STORE } from '../redux/network/api';
import { download, upload } from '../utils';
import TextArea from 'antd/es/input/TextArea';
import dayjs, { Dayjs } from 'dayjs';
import updateLocale from 'dayjs/plugin/updateLocale';
import { withTranslation } from 'react-i18next';
import i18n from "../locales/i18n";

dayjs.extend(updateLocale)
dayjs.updateLocale('en', {
    weekStart: 1
})

const { Option } = Select;

interface CalendarEvent extends ExtendedAppointment {
    title: string;
    start: Date;
    end: Date;
}

interface IModalProps {
    visible: boolean;
    updateLoading: boolean;
    selectedEvent: CalendarEvent | null;
    onClose: () => void;
    onSave: () => void;
    updateAppointmentRequest: (
        id: string,
        appointment: Appointment
    ) => Promise<any>;
    calendars?: Calendar[];
    isContact?: boolean;
    disabled?: boolean;
}

interface IModalState {
    employee_remarks?: string;
    ended_at?: Date;
    savedFileList: Attachment[],
    calendarId: string;
    uploading: boolean,
    contact: Contact | null,
    contactLoading: boolean
}

class AppointmentDetailsModal extends React.Component<IModalProps, IModalState> {
    constructor(props: IModalProps) {
        super(props);
        this.state = {
            savedFileList: [],
            uploading: false,
            contact: null,
            contactLoading: true,
            calendarId: props.selectedEvent?.calendar_id || "",
        };
    }

    fetchContactData = async () => {
        this.setState({ contactLoading: true });
        const { selectedEvent } = this.props;
        // @ts-ignore
        const contact_id = selectedEvent.contact_id;

        const contact = await fetchContactById(contact_id);

        if (selectedEvent)
            this.setState({
                employee_remarks: selectedEvent.employee_remarks || '',
                ended_at: selectedEvent.ended_at ? dayjs(selectedEvent.ended_at).toDate() : undefined,
                savedFileList: selectedEvent.employee_attachments?.length ? selectedEvent.employee_attachments : [],
                contact,
                contactLoading: false
            })
    }

    componentDidMount(): void {
        this.fetchContactData();
    }
    renderEventModal = () => {
        const { contact } = this.state;
        const { selectedEvent } = this.props

        const onClose = () => {
            this.props.onClose();
        }

        const onSave = () => {
            // @ts-ignore
            const { _id, createdAt, updatedAt, service, title, start, end, sourceResource, resourceId, ...propsToUpdate } = selectedEvent!
            const { savedFileList, employee_remarks, ended_at, calendarId } = this.state;

            this.props
                .updateAppointmentRequest(selectedEvent?._id!, {
                    ...propsToUpdate,
                    ...{
                        employee_remarks: employee_remarks ?? undefined,
                        ended_at: ended_at ? ended_at?.toISOString() : undefined,
                        employee_attachments: savedFileList,
                        calendar_id: calendarId
                    }
                })
                .then((data) => {
                    if (data._id) {
                        message.success(i18n.t('successfully_updated_the_appointment'));
                        this.props.onSave();
                    } else {
                        message.error(i18n.t('something_went_wrong_please_try_again'));
                    }
                });
        };



        const requestAttachments = () => {
            return (
                <>
                    <List
                        dataSource={selectedEvent?.attachments || []}
                        renderItem={(item) => (
                            <List.Item>
                                <Row>
                                    <Col span={24}>
                                        <div className="flex flex-col">
                                            <img src={FILES_STORE + item.url} width={'100%'} className="object-contain" height={250} />
                                            <Button
                                                className="self-start"
                                                type="link"
                                                onClick={() => download(item.title)}
                                            >
                                                {i18n.t('download')}
                                            </Button>
                                        </div>
                                    </Col>
                                </Row>
                            </List.Item>
                        )}
                    />
                </>
            )
        }

        const renderEmployeeActions = () => {
            const { savedFileList, uploading } = this.state;

            const setSavedFileList = (files: Attachment[]) => {
                this.setState({
                    savedFileList: files
                })
            }

            const setUploading = (uploading: boolean) => {
                this.setState({
                    uploading: uploading
                })
            }

            const removeAttachment = (file: string) => {
                let filteredFiles = this.state.savedFileList.filter((fileUrl) => fileUrl.title !== file);
                setSavedFileList(filteredFiles);
            }

            return (
                <>
                    <Row className="mb-6">
                        <Col span={8} className="w-full">
                            <span>{i18n.t('employee_remarks')}</span>
                        </Col>
                        <Col span={16}>
                            <TextArea
                                onChange={(e) => {
                                    this.setState({ employee_remarks: e.target.value });
                                }}
                                value={this.state.employee_remarks}
                            />
                        </Col>
                    </Row>
                    <Row className="mb-6">
                        <Col span={8} className="w-full">
                            <span>{i18n.t('ended_at')}</span>
                        </Col>
                        <Col span={16}>
                            <DatePicker
                                onChange={(value) => {
                                    this.setState({ ended_at: dayjs(value).toDate() });
                                }}
                                format={"YYYY-MM-DD HH:mm"}
                                showTime
                                disabledDate={(current) =>
                                    current && current.isAfter(dayjs(), "day")
                                }
                                value={this.state.ended_at ? dayjs(this.state.ended_at) : null}
                            />
                        </Col>
                    </Row>

                    <Row gutter={16} wrap={false}>
                        <Col span={24}>
                            <Form.Item>
                                <Upload.Dragger
                                    accept=".jpeg,.jpg,.png"
                                    name="attachments"
                                    listType="picture"
                                    fileList={[
                                        ...savedFileList.map((a, i) => ({
                                            uid: i + "",
                                            name: a.title,
                                            status: "done",
                                            url: FILES_STORE + a.url,
                                        })),
                                        ...(uploading
                                            ? [
                                                {
                                                    uid: savedFileList.length + "",
                                                    name: "",
                                                    status: "uploading",
                                                    url: "",
                                                },
                                            ]
                                            : []),
                                    ] as any}
                                    onRemove={(file) => removeAttachment(file.name)}
                                    customRequest={async (data: any) => {
                                        setUploading(true);
                                        const res = await upload(data.file);
                                        const url = res.uri;
                                        setUploading(false);
                                        data.onSuccess(url);
                                        setSavedFileList([...savedFileList, { url, title: data.file.name }]);
                                    }}>
                                    <Space size={14} align="center" className="m-0">
                                        <p className="upload-hint-label">
                                            {i18n.t('upload_a_photo_of_the_result_if_any')}
                                        </p>
                                    </Space>
                                </Upload.Dragger>
                            </Form.Item>
                        </Col>
                    </Row>
                </>
            )
        }

        const appointmentOverview = () => {
            const { contactLoading } = this.state;

            return (
                <Spin spinning={contactLoading}>
                    <Row className="mb-6" gutter={[16, 16]}>
                        <Col span={12} className="w-full">
                            <label>{i18n.t('performance')}</label>
                            <Input value={selectedEvent?.title} />
                        </Col>
                        <Col span={12}>
                            <label>{i18n.t('time')}</label>
                            <Input value={dayjs(selectedEvent?.start_date).format("HH:mm A") + " - " + dayjs(selectedEvent?.end_date).format("HH:mm A")} />
                        </Col>
                    </Row>
                    <Row className="mb-6" gutter={[16, 16]}>
                        <Col span={8} className="w-full">
                            <label>{i18n.t('salutation')}</label>
                            <Input value={contact?.salutation} />
                        </Col>
                        <Col span={8}>
                            <label>{i18n.t('name')}</label>
                            <Input value={contact?.first_name + " " + contact?.last_name} />
                        </Col>
                        <Col span={8}>
                            <label>{i18n.t('telephone')}</label>
                            <Input value={contact?.telephone} />
                        </Col>
                    </Row>
                    <Row className="mb-6" gutter={[16, 16]}>
                        <Col span={8} className="w-full">
                            <label>{i18n.t('address')}</label>
                            <Input value={contact?.address} />
                        </Col>
                        <Col span={8}>
                            <label>{i18n.t('zip_code')}</label>
                            <Input value={contact?.zip_code} />
                        </Col>
                        <Col span={8}>
                            <label>{i18n.t('location')}</label>
                            <Input value={contact?.location} />
                        </Col>
                    </Row>
                    <Row className="mb-6" gutter={[16, 16]}>
                        <Col span={12} className="w-full">
                            <label>{i18n.t('email')}</label>
                            <Input value={contact?.email} />
                        </Col>
                        <Col span={12}>
                            <label>{i18n.t('brand_of_device')}</label>
                            <Input value={selectedEvent?.brand_of_device} />
                        </Col>
                    </Row>
                    <Row className="mb-6" gutter={[16, 16]}>
                        <Col span={12} className="w-full">
                            <label>{i18n.t('device_model')}</label>
                            <Input value={selectedEvent?.model} />
                        </Col>
                        <Col span={12}>
                            <label>{i18n.t('year')}</label>
                            <Input value={selectedEvent?.year} />
                        </Col>
                    </Row>
                    <Row className="mb-6" gutter={[16, 16]}>
                        <Col span={24} className="w-full">
                            <label>{i18n.t('customer_remarks')}</label>
                            <TextArea value={selectedEvent?.remarks} />
                        </Col>
                    </Row>
                    <Row className="mb-6" gutter={[16, 16]}>
                        <Checkbox checked={selectedEvent?.exhaust_gas_measurement} >
                            {i18n.t('exhaust_gas_measurement')}
                        </Checkbox>
                    </Row>
                    <Row className="mb-6" gutter={[16, 16]}>
                        <Checkbox checked={selectedEvent?.has_bgas_before} >
                            {i18n.t('has_bgas_before')}
                        </Checkbox>
                    </Row>
                    <Row className="mb-6" gutter={[16, 16]}>
                        <Checkbox checked={selectedEvent?.has_maintenance_agreement} >
                            {i18n.t('has_maintenance_agreement')}
                        </Checkbox>
                    </Row>
                </Spin>
            )
        }

        const renderAssignedCalendar = () => {
            const { calendarId } = this.state;

            const onSelectCalendar = (value: any) => {
                this.setState({ calendarId: value })
            }

            return (
                <Row>
                    <Col span={24}>
                        <label>{i18n.t('calendar')}</label>
                        <Select className="w-full mt-3 mb-6" value={calendarId} onChange={(value) => {
                            onSelectCalendar(value)
                        }}>
                            {this.props.calendars?.map((calendar) => {
                                return (
                                    <Option key={calendar._id} value={calendar._id}>{calendar.employee_name}</Option>
                                )
                            })}
                        </Select>
                    </Col>
                </Row>
            )
        }

        return (
            <Modal
                title={i18n.t('appointment_details')}
                open={this.props.visible}
                centered
                footer={() => {
                    return this.props.disabled ? null : (
                        <>
                            <Button onClick={onClose}>{i18n.t('cancel')}</Button>
                            <Button type="primary" onClick={onSave}>{i18n.t('save')}</Button>
                        </>
                    )
                }}
                closable={true}
                onCancel={() => onClose()}
                confirmLoading={this.props.updateLoading}
                width={800}
            >
                <Divider />
                <Tabs
                    defaultActiveKey="1"
                    // @ts-ignore
                    items={[
                        {
                            key: "1",
                            label: i18n.t('appointment_overview'),
                            children: appointmentOverview(),
                        },
                        {
                            key: "2",
                            label: i18n.t('request_attachments'),
                            children: requestAttachments(),
                        },
                        this.props.isContact ? null : {
                            key: "3",
                            label: i18n.t('notes_files'),
                            children: renderEmployeeActions(),
                        },
                        this.props.calendars ? {
                            key: "4",
                            label: i18n.t('calendar'),
                            children: renderAssignedCalendar(),
                        } : null
                    ].filter(Boolean)}
                />
            </Modal>
        )
    }

    render() {
        const { visible } = this.props;
        return (
            <>
                {visible && this.renderEventModal()}
            </>
        );
    }
}


const mapStateToProps = (state: RootState) => ({
    updateLoading: selectUpdateAppointmentLoading(state),
});

const mapDispatchToProps = (
    dispatch: ThunkDispatch<RootState, undefined, any>
) => ({
    updateAppointmentRequest: (id: string, appointment: Appointment) =>
        dispatch(updateAppointmentRequest(id, appointment)),
});

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(AppointmentDetailsModal))
