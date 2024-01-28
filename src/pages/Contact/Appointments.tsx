import React from "react";
import { connect } from "react-redux";
import { RootState } from "../../redux/store";
import {
  fetchContactAppointments,
  updateAppointmentRequest,
  deleteAppointmentRequest,
} from "../../redux/actions";
import {
  selectContactAppointments,
  selectContactAppointmentsLoading,
  selectDeleteAppointmentLoading,
  selectUpdateAppointmentLoading,
} from "../../redux/selectors";
import { Appointment, ContactAppointment, Service } from "../../Schema";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { compose } from "redux";
import {
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Form,
  Input,
  List,
  Modal,
  Popconfirm,
  Row,
  Select,
  Spin,
  Table,
  message,
} from "antd";
import dayjs from "dayjs";

import withRouter, { RouteParams } from "../../HOC/withRouter";
import { FILES_STORE } from "../../redux/network/api";
import { download } from "../../utils";

const { Column } = Table;
const { Option } = Select;

interface IAppointmentsState {
  visible: boolean;
  editingAppointmentId: string | null;
  attachmentModelId: string | null;
}

interface IAppointmentsProps {
  loading: boolean;
  appointments: ContactAppointment[];
  updateAppointmentLoading: boolean;
  deleteAppointmentLoading: boolean;
  fetchContactAppointments: (contactId: string) => Promise<any>;
  updateAppointmentRequest: (
    id: string,
    appointment: Appointment
  ) => Promise<any>;
  deleteAppointmentRequest: (id: string) => Promise<any>;
  params?: RouteParams;
  navigate?: (route: string) => void;
}

class AppointmentsPage extends React.Component<
  IAppointmentsProps,
  IAppointmentsState
> {
  constructor(props: IAppointmentsProps) {
    super(props);
    this.state = {
      visible: false,
      editingAppointmentId: null,
      attachmentModelId: null,
    };
  }

  formRef = React.createRef<any>();

  fetchData = () => {
    if (this.props.params) {
      const params = this.props.params;
      const { contactId } = params;

      this.props.fetchContactAppointments(contactId);
    }
  };

  componentDidMount() {
    this.fetchData();
  }

  onOpen = (id: string | null = null) => {
    this.setState({ visible: true, editingAppointmentId: id });
  };

  onOpenAttachmentModel = (id: string | null = null) => {
    this.setState({ attachmentModelId: id });
  };

  onDeleteAppointment = (id: string) => {
    this.props.deleteAppointmentRequest(id).then((data) => {
      if (data.status && data.status === "success") {
        message.success("Successfully deleted the appointment");
      } else {
        message.error("Something went wrong. please try again");
      }
    });
  };

  renderAttachmentsModal = () => {
    const { attachmentModelId } = this.state;
    const { appointments } = this.props;

    if (!attachmentModelId) {
      return null;
    }

    const attachments = appointments.filter(el => el._id === attachmentModelId)[0].attachments;


    return (
      <Modal
        title={"Attachments"}
        open={Boolean(attachmentModelId)}
        centered
        closable={true}
        footer={() => null}
        onCancel={() => this.onOpenAttachmentModel(null)}
        width={800}
      >
        <Divider />
        <List
          dataSource={attachments}
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
      </Modal>
    );
  }

  renderUpdateAppointmentModal = () => {
    const { visible, editingAppointmentId } = this.state;
    const initialValues = this.props.appointments.find(
      (c) => c._id === editingAppointmentId
    );



    const onClose = () => {
      this.setState({ visible: false });
    };

    const onFinish = (appointment: Appointment) => {
      const { editingAppointmentId } = this.state;
      const { _id, createdAt, updatedAt, service, ...propsToUpdate } = initialValues!


      this.props
        .updateAppointmentRequest(editingAppointmentId!, { ...propsToUpdate, ...appointment })
        .then((data) => {
          if (data._id) {
            message.success("Successfully updated the appointment");
            this.setState({ visible: false, editingAppointmentId: null });
          } else {
            message.error("Something went wrong. please try again");
          }
        });
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from(
      { length: currentYear - 2003 },
      (_, index) => currentYear - index
    ).map(String);

    return (
      <Modal
        title={"Edit Appointment Details"}
        open={visible}
        centered
        closable={false}
        footer={() => null}
        width={800}
      >
        <Divider />

        <Form
          ref={this.formRef}
          name="contactForm"
          layout="vertical"
          onFinish={onFinish}
          initialValues={initialValues}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Model/Type (e.g VCW AT 174/4-5. HG 15 WK19)"
                name="model"
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Brand of Device" name="brand_of_device">
                <Select>
                  {[
                    "Baxi",
                    "Buderus",
                    "De Dietrich",
                    "To give",
                    "Junkers",
                    "Praiseworthy",
                    "Nordgas",
                    "Orange",
                    "Rapido",
                    "Saunier Duval",
                    "Vaillant",
                    "Viessmann",
                    "Wolf",
                    "Other",
                  ].map((salutation) => (
                    <Option key={salutation} value={salutation}>
                      {salutation}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Year"
                name="year"
                rules={[
                  {
                    required: true,
                    message: "Please select a year",
                  },
                ]}
              >
                <Select placeholder="Select a year">
                  {["Last year", `I don't know anymore`]
                    .concat(years)
                    .map((year) => (
                      <Option key={year} value={year}>
                        {year}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Notes" name="remarks">
                <Input.TextArea />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Do you have a maintenance agreement with us?"
            name="has_maintenance_agreement"
            rules={[{ required: true }]}
          >
            <Select>
              {[
                { lable: "No", value: false },
                {
                  lable:
                    "Yes, the prices according to the maintenance agreement apply",
                  value: true,
                },
              ].map((el) => (
                <Option key={el.lable} value={el.value}>
                  {el.lable}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="exhaust_gas_measurement" valuePropName="checked">
            <Checkbox>
              Exhaust Gas Measurement with test result (+ €40)
            </Checkbox>
          </Form.Item>
          <Form.Item name="has_bgas_before" valuePropName="checked">
            <Checkbox>Yes, B-GAS has been with me before</Checkbox>
          </Form.Item>

          <Row gutter={16} justify={"end"}>
            <Col span={3}>
              <Button onClick={onClose}>Cancel</Button>
            </Col>
            <Col span={3}>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Submit
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  };

  render() {
    const { loading, appointments, deleteAppointmentLoading } = this.props;

    return (
      <>
        {this.renderUpdateAppointmentModal()}
        {this.renderAttachmentsModal()}
        <Card
          title={"Appointments"}
          extra={
            <Button
              onClick={() => {
                if (this.props.navigate) {
                  this.props.navigate("/contact");
                }
              }}
              type="link"
            >
              Go back to contacts
            </Button>
          }
        >
          <Spin spinning={loading}>
            <Table
              dataSource={appointments}
              style={{ marginTop: 20 }}
              rowKey="_id"
              pagination={false}
            >
              <Column
                title="Service"
                dataIndex={"service"}
                render={(service: Service) => {
                  return <span>{service.name}</span>;
                }}
              />
              <Column
                title="Duration"
                dataIndex={"service"}
                render={(service: Service) => {
                  return <span>{service.duration} mins</span>;
                }}
              />
              <Column
                title="Price"
                dataIndex={"service"}
                render={(service: Service) => {
                  return <span>{service.price} EUR</span>;
                }}
              />
              <Column
                title="Date"
                render={(_: any, record: ContactAppointment) => {
                  return (
                    <span>{dayjs(record.start_date).format("YYYY-MM-DD")}</span>
                  );
                }}
              />
              <Column
                title="Time"
                render={(_: any, record: ContactAppointment) => {
                  const startDateTime = dayjs(record.start_date);
                  const endDateTime = dayjs(record.end_date);

                  const offsetMinutes = startDateTime.utcOffset();

                  const formattedTime =
                    startDateTime.subtract(offsetMinutes, 'minute').format("HH:mm A") +
                    " - " +
                    endDateTime.subtract(offsetMinutes, 'minute').format("HH:mm A");

                  return <span>{formattedTime}</span>;
                }}
              />
              <Column title="Brand" dataIndex={"brand_of_device"} />
              <Column title="Model" dataIndex={"model"} />
              <Column
                title="Action"
                key="action"
                render={(_: any, record: Appointment) => (
                  <Row>
                    <Button
                      className="self-end mr-3"
                      type="link"
                      onClick={() => this.onOpen(record._id)}
                    >
                      Edit
                    </Button>
                    <Popconfirm
                      title="Delete this appointment?"
                      description="Are you sure you want to delete this appointment?"
                      okText="Delete It"
                      cancelText="No"
                      okButtonProps={{
                        danger: true,
                      }}
                      onConfirm={() => this.onDeleteAppointment(record._id!)}
                    >
                      <Button
                        className="self-end mr-3"
                        type="link"
                        loading={deleteAppointmentLoading}
                      >
                        Delete
                      </Button>
                    </Popconfirm>
                  </Row>
                )}
              />
              <Column
                title="attachments"
                key="attachments"
                render={(_: any, record: Appointment) => (
                  <Row>
                    {record.attachments?.length ? <Button
                      className="self-end mr-3"
                      type="link"
                      onClick={() => this.onOpenAttachmentModel(record._id)}
                    >
                      View
                    </Button> : null}
                  </Row>
                )}
              />
            </Table>
          </Spin>
        </Card>
      </>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  appointments: selectContactAppointments(state),
  loading: selectContactAppointmentsLoading(state),
  updateAppointmentLoading: selectUpdateAppointmentLoading(state),
  deleteAppointmentLoading: selectDeleteAppointmentLoading(state),
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<RootState, undefined, any>
) => ({
  fetchContactAppointments: (contactId: string) =>
    dispatch(fetchContactAppointments(contactId)),
  updateAppointmentRequest: (id: string, appointment: Appointment) =>
    dispatch(updateAppointmentRequest(id, appointment)),
  deleteAppointmentRequest: (id: string) =>
    dispatch(deleteAppointmentRequest(id)),
});

export default compose(withRouter)(
  connect(mapStateToProps, mapDispatchToProps)(AppointmentsPage)
);
