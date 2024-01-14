import React from "react";
import { connect } from "react-redux";
import { RootState } from "../../redux/store";
import {
  fetchContacts,
  createContactRequest,
  deleteContactRequest,
  updateContactRequest,
} from "../../redux/actions";
import { selectContacts, selectContactsLoading } from "../../redux/selectors";
import { Contact, Salutation } from "../../Schema";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { compose } from 'redux'
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  Modal,
  Pagination,
  Popconfirm,
  Row,
  Select,
  Spin,
  Table,
  message,
} from "antd";
import withRouter from "../../HOC/withRouter";

const { Column } = Table;
const { Option } = Select;

interface IContactState {
  visible: boolean;
  pageNum: number;
  totalCount: number;
  pageCount: number;
  currentPage: number;
  editingContactId: string | null;
}

interface IContactProps {
  loading: boolean;
  fetchContacts: (page: number, limit: number) => Promise<any>;
  createContactRequest: (contact: Contact) => Promise<any>;
  deleteContactRequest: (id: string) => Promise<any>;
  updateContactRequest: (id: string, contact: Contact) => Promise<any>;
  contacts: Contact[];
  navigate?: (route: string) => void;
}

class ContactPage extends React.Component<IContactProps, IContactState> {
  constructor(props: IContactProps) {
    super(props);
    this.state = {
      visible: false,
      pageNum: 1,
      totalCount: 0,
      pageCount: 10,
      currentPage: 1,
      editingContactId: null,
    };
  }

  formRef = React.createRef<any>();

  fetchData = () => {
    const { pageNum, pageCount } = this.state;

    this.props.fetchContacts(pageNum, pageCount).then((data) => {
      if (data.metaData && data.metaData.totalItems) {
        this.setState({
          totalCount: data.metaData.totalItems,
          pageNum: data.metaData.currentPage,
          pageCount: data.metaData.itemsPerPage,
          currentPage: data.metaData.currentPage,
        });
      }
    });
  };

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps: IContactProps, prevState: IContactState) {
    const { totalCount, pageNum, pageCount } = this.state;

    if (
      prevState.totalCount !== totalCount ||
      prevState.pageNum !== pageNum ||
      prevState.pageCount !== pageCount
    ) {
      this.fetchData();
    }
  }

  onOpen = (contactId: string | null = null) => {
    this.setState({ visible: true, editingContactId: contactId });
  };

  handlePageChange = (value: number) => {
    this.setState({ pageNum: value });
  };

  handlePageSizeChange = (_: number, value: number) => {
    this.setState({ pageNum: 1, pageCount: value });
  };

  onDeleteContact = (id: string) => {
    this.props.deleteContactRequest(id).then((data) => {
      if (data.status && data.status === "success") {
        message.success("Successfully deleted the contact");
      } else {
        message.error("Something went wrong. please try again");
      }
    });
  };

  renderNewContactModal = () => {
    const { visible, editingContactId } = this.state;

    const isEditing = !!editingContactId;
    const modalTitle = isEditing ? "Edit Contact" : "New Contact";

    const initialValues = isEditing
      ? this.props.contacts.find((c) => c._id === editingContactId)
      : undefined;

    const onClose = () => {
      this.setState({ visible: false });
    };

    const onFinish = (contact: Contact) => {
      const { editingContactId } = this.state;

      if (isEditing && editingContactId) {
        this.props
          .updateContactRequest(editingContactId, contact)
          .then((data) => {
            if (data._id) {
              message.success("Successfully updated the contact");
              this.setState({ visible: false, editingContactId: null });
            } else {
              message.error("Something went wrong. please try again");
            }
          });
      } else {
        this.props.createContactRequest(contact).then((data) => {
          if (data._id) {
            message.success("Successfully created the contact");
            this.setState({ visible: false });
          } else {
            message.error("Something went wrong. please try again");
          }
        });
      }
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from(
      { length: currentYear - 2003 },
      (_, index) => currentYear - index
    ).map(String);

    return (
      <Modal
        title={modalTitle}
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
            <Col span={8}>
              <Form.Item
                label="Salutation"
                name="salutation"
                rules={[{ required: true }]}
              >
                <Select>
                  {Object.values(Salutation).map((salutation) => (
                    <Option key={salutation} value={salutation}>
                      {salutation}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="First Name"
                name="first_name"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Last Name"
                name="last_name"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Street/No./Stairs/Door"
                name="address"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="ZIP CODE"
                name="zip_code"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Location"
                name="location"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Telephone"
                name="telephone"
                rules={[{ required: true }]}
              >
                <Input type="tel" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Phone 2"
                name="phone_numbber_2"
                rules={[{ required: false }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Phone 3"
                name="phone_numbber_3"
                rules={[{ required: false }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ required: true, type: "email" }]}
              >
                <Input />
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
          <Divider className="mb-2 mt-0" />
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
    const { pageNum, totalCount, currentPage, pageCount } = this.state;
    const { loading, contacts } = this.props;

    return (
      <>
        {this.renderNewContactModal()}
        <Card
          title="Contacts"
          extra={
            <Button onClick={() => this.onOpen()} type="primary">
              New Contact
            </Button>
          }
        >
          <Spin spinning={loading}>
            <Table
              dataSource={contacts}
              style={{ marginTop: 20 }}
              rowKey="_id"
              pagination={false}
            >
              <Column
                title="#"
                dataIndex={"_"}
                render={(_: number, __: number, index: number) => {
                  return (
                    <span>{(currentPage - 1) * pageCount + index + 1}</span>
                  );
                }}
              />
              <Column title="Title" dataIndex={"salutation"} />
              <Column title="First Name" dataIndex={"first_name"} />
              <Column title="Last Name" dataIndex={"last_name"} />
              <Column title="Email" dataIndex={"email"} />
              <Column title="Telephone" dataIndex={"telephone"} />
              <Column title="Location" dataIndex={"location"} />
              <Column
                title="Appointments"
                dataIndex={""}
                render={(_: any, record: Contact) => (
                  <Button
                    className="self-end mr-3"
                    type="link"
                    onClick={() => {
                      if (this.props.navigate) {
                        this.props.navigate(`/contact/appointments/${record._id}`)
                      }
                    }}
                  >
                    View
                  </Button>
                )}
              />
              <Column
                title="Action"
                key="action"
                render={(_: any, record: Contact) => (
                  <Row>
                    <Button
                      className="self-end mr-3"
                      type="link"
                      onClick={() => this.onOpen(record._id)}
                    >
                      Edit
                    </Button>
                    <Popconfirm
                      title="Delete this contact?"
                      description="Are you sure you want to delete this contact?"
                      okText="Delete It"
                      cancelText="No"
                      okButtonProps={{
                        danger: true,
                      }}
                      onConfirm={() => this.onDeleteContact(record._id!)}
                    >
                      <Button className="self-end mr-3" type="link">
                        Delete
                      </Button>
                    </Popconfirm>
                  </Row>
                )}
              />
            </Table>
            <Pagination
              current={pageNum}
              total={totalCount}
              pageSize={pageCount}
              onChange={this.handlePageChange}
              style={{ marginTop: 20 }}
              showSizeChanger
              onShowSizeChange={this.handlePageSizeChange}
            />
          </Spin>
        </Card>
      </>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  contacts: selectContacts(state),
  loading: selectContactsLoading(state),
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<RootState, undefined, any>
) => ({
  fetchContacts: (page: number, limit: number) =>
    dispatch(fetchContacts(page, limit)),
  createContactRequest: (contact: Contact) =>
    dispatch(createContactRequest(contact)),
  deleteContactRequest: (id: string) => dispatch(deleteContactRequest(id)),
  updateContactRequest: (id: string, contact: Contact) =>
    dispatch(updateContactRequest(id, contact)),
});

export default compose(
  withRouter,
)(connect(mapStateToProps, mapDispatchToProps)(ContactPage))
