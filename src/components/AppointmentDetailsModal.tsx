import { Button, Checkbox, Col, DatePicker, Divider, Form, Input, List, Modal, Row, Space, Spin, Tabs, Upload, message } from 'antd';
import React from 'react';
import { ThunkDispatch } from "@reduxjs/toolkit";
import { connect } from "react-redux";
import { Appointment, Attachment, Contact, ContactAppointment } from '../Schema';
import { RootState } from '../redux/store';
import { selectUpdateAppointmentLoading } from '../redux/selectors';
import { fetchContactById, updateAppointmentRequest } from '../redux/actions';
import { FILES_STORE } from '../redux/network/api';
import { download, upload } from '../utils';
import TextArea from 'antd/es/input/TextArea';
import dayjs, { Dayjs } from 'dayjs';
import updateLocale from 'dayjs/plugin/updateLocale';

dayjs.extend(updateLocale)
dayjs.updateLocale('en', {
    weekStart: 1
})

interface CalendarEvent extends ContactAppointment {
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
}

interface IModalState {
    employee_remarks?: string;
    ended_at?: Date;
    savedFileList: Attachment[],
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
                const { _id, createdAt, updatedAt, service, title, start, end, ...propsToUpdate } = selectedEvent!
                const { savedFileList, employee_remarks, ended_at } = this.state;
    
                this.props
                    .updateAppointmentRequest(selectedEvent?._id!, {
                        ...propsToUpdate,
                        ...{
                            employee_remarks: employee_remarks ?? undefined,
                            ended_at: ended_at ? ended_at?.toISOString() : undefined,
                            employee_attachments: savedFileList,
                        }
                    })
                    .then((data) => {
                        if (data._id) {
                            message.success("Successfully updated the appointment");
                            this.props.onSave();
                        } else {
                            message.error("Something went wrong. please try again");
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
                                                Download
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
                            <span>Employee remarks</span>
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
                            <span>Ended at</span>
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
                                            upload a photo of the result if any
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
                            <label>Performance</label>
                            <Input value={selectedEvent?.title} />
                        </Col>
                        <Col span={12}>
                            <label>Time</label>
                            <Input value={dayjs(selectedEvent?.start_date).format("HH:mm A") + " - " + dayjs(selectedEvent?.end_date).format("HH:mm A")} />
                        </Col>
                    </Row>
                    <Row className="mb-6" gutter={[16, 16]}>
                        <Col span={8} className="w-full">
                            <label>Salutation</label>
                            <Input value={contact?.salutation} />
                        </Col>
                        <Col span={8}>
                            <label>Name</label>
                            <Input value={contact?.first_name + " " + contact?.last_name} />
                        </Col>
                        <Col span={8}>
                            <label>Telephone</label>
                            <Input value={contact?.telephone} />
                        </Col>
                    </Row>
                    <Row className="mb-6" gutter={[16, 16]}>
                        <Col span={8} className="w-full">
                            <label>Street/No./Stairs/Door</label>
                            <Input value={contact?.address} />
                        </Col>
                        <Col span={8}>
                            <label>ZIP CODE</label>
                            <Input value={contact?.zip_code} />
                        </Col>
                        <Col span={8}>
                            <label>Location</label>
                            <Input value={contact?.location} />
                        </Col>
                    </Row>
                    <Row className="mb-6" gutter={[16, 16]}>
                        <Col span={12} className="w-full">
                            <label>Email</label>
                            <Input value={contact?.email} />
                        </Col>
                        <Col span={12}>
                            <label>Brand of Device</label>
                            <Input value={selectedEvent?.brand_of_device} />
                        </Col>
                    </Row>
                    <Row className="mb-6" gutter={[16, 16]}>
                        <Col span={12} className="w-full">
                            <label>Model/Type (e.g VCW AT 174/4-5. HG 15 WK19)</label>
                            <Input value={selectedEvent?.model} />
                        </Col>
                        <Col span={12}>
                            <label>Year</label>
                            <Input value={selectedEvent?.year} />
                        </Col>
                    </Row>
                    <Row className="mb-6" gutter={[16, 16]}>
                        <Col span={24} className="w-full">
                            <label>Customer Remarks</label>
                            <TextArea value={selectedEvent?.remarks} />
                        </Col>
                    </Row>
                    <Row className="mb-6" gutter={[16, 16]}>
                        <Checkbox checked={selectedEvent?.exhaust_gas_measurement} >
                            Exhaust Gas Measurement with test result (+ €40)
                        </Checkbox>
                    </Row>
                    <Row className="mb-6" gutter={[16, 16]}>
                        <Checkbox checked={selectedEvent?.has_bgas_before} >
                            B-GAS has been with me before
                        </Checkbox>
                    </Row>
                    <Row className="mb-6" gutter={[16, 16]}>
                        <Checkbox checked={selectedEvent?.has_maintenance_agreement} >
                            have a maintenance agreement with us?
                        </Checkbox>
                    </Row>
                </Spin>
            )
        }

        return (
            <Modal
                title="Appointment Details"
                open={this.props.visible}
                centered
                okText={'Save'}
                cancelText={'Cancel'}
                closable={false}
                onCancel={onClose}
                onOk={onSave}
                confirmLoading={this.props.updateLoading}
                width={800}
            >
                <Divider />
                <Tabs
                    defaultActiveKey="1"
                    items={[
                        {
                            key: "1",
                            label: "Appointment overview",
                            children: appointmentOverview(),
                        },
                        {
                            key: "2",
                            label: "Request Attachments",
                            children: requestAttachments(),
                        },
                        {
                            key: "3",
                            label: "Notes/Files",
                            children: renderEmployeeActions(),
                        },
                    ]}
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

export default connect(mapStateToProps, mapDispatchToProps)(AppointmentDetailsModal)
