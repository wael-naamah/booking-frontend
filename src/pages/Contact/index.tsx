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
import { withTranslation } from 'react-i18next';
import i18n from "../../locales/i18n";
import withAuthorization from "../../HOC/withAuthorization";

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
        message.success(i18n.t('successfully_deleted_the_contact'));
      } else {
        message.error(i18n.t('something_went_wrong_please_try_again'));
      }
    });
  };

  renderNewContactModal = () => {
    const { visible, editingContactId } = this.state;

    const isEditing = !!editingContactId;
    const modalTitle = isEditing ? i18n.t('edit_contact') : i18n.t('new_contact');

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
              message.success(i18n.t('successfully_updated_the_contact'));
              this.setState({ visible: false, editingContactId: null });
            } else {
              if (data && data.errorValidation && data.errorValidation.fields && data.errorValidation.fields.email) {
                message.error(data.errorValidation.fields.email)
              }
              else if (data && data.errorValidation && data.errorValidation.fields && data.errorValidation.fields.password) {
                message.error(data.errorValidation.fields.password)
              } else {
                message.error(i18n.t('something_went_wrong_please_try_again'))
              }
            }
          });
      } else {
        this.props.createContactRequest(contact).then((data) => {
          if (data._id) {
            message.success(i18n.t('successfully_created_the_contact'));
            this.setState({ visible: false });
          } else {
            message.error(i18n.t('something_went_wrong_please_try_again'));
          }
        });
      }
    };


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
                label={i18n.t('salutation')}
                name="salutation"
                rules={[{ required: true }]}
              >
                <Select>
                  {[
                    { lable: i18n.t('mr'), value: Salutation.MISTER },
                    { lable: i18n.t('mrs'), value: Salutation.WOMAN },
                    { lable: i18n.t('company'), value: Salutation.COMPANY },
                  ].map((el) => (
                    <Option key={el.lable} value={el.value}>
                      {el.lable}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={i18n.t('first_name')}
                name="first_name"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={i18n.t('last_name')}
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
                label={i18n.t('address')}
                name="address"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={i18n.t('zip_code')}
                name="zip_code"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={i18n.t('location')}
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
                label={i18n.t('telephone')}
                name="telephone"
                rules={[{ required: true }]}
              >
                <Input type="tel" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={i18n.t('phone_2')}
                name="phone_numbber_2"
                rules={[{ required: false }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={i18n.t('phone_3')}
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
                label={i18n.t('email')}
                name="email"
                rules={[{ required: true, type: "email" }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label={i18n.t('password')}
                name="password"
                rules={[{ required: false, type: "string" }]}
              >
                <Input type="password" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label={i18n.t('notes')} name="remarks">
                <Input.TextArea />
              </Form.Item>
            </Col>
          </Row>
          <Divider className="mb-2 mt-0" />
          <Row gutter={16} justify={"end"}>
            <Col span={3}>
              <Button onClick={onClose}>{i18n.t('cancel')}</Button>
            </Col>
            <Col span={3}>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  {i18n.t('save')}
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  };

  render() {
    const { pageNum, totalCount, currentPage, pageCount, visible } = this.state;
    const { loading, contacts } = this.props;

    return (
      <>
        {visible ? this.renderNewContactModal() : null}
        <Card
          title={i18n.t('contacts')}
          extra={
            <Button onClick={() => this.onOpen()} type="primary">
              {i18n.t('new_contact')}
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
              <Column title={i18n.t('title')} dataIndex={"salutation"} />
              <Column title={i18n.t('first_name')} dataIndex={"first_name"} />
              <Column title={i18n.t('last_name')} dataIndex={"last_name"} />
              <Column title={i18n.t('email')} dataIndex={"email"} />
              <Column title={i18n.t('telephone')} dataIndex={"telephone"} />
              <Column title={i18n.t('location')} dataIndex={"location"} />
              <Column
                title={i18n.t('appointments')}
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
                    {i18n.t('view')}
                  </Button>
                )}
              />
              <Column
                title={i18n.t('action')}
                key="action"
                render={(_: any, record: Contact) => (
                  <Row>
                    <Button
                      className="self-end mr-3"
                      type="link"
                      onClick={() => this.onOpen(record._id)}
                    >
                      {i18n.t('edit')}
                    </Button>
                    <Popconfirm
                      title={i18n.t('delete_this_contact')}
                      description={i18n.t('are_you_sure_you_want_to_delete_this_contact')}
                      okText={i18n.t('delete_it')}
                      cancelText={i18n.t('no')}
                      okButtonProps={{
                        danger: true,
                      }}
                      onConfirm={() => this.onDeleteContact(record._id!)}
                    >
                      <Button className="self-end mr-3" type="link">
                        {i18n.t('delete')}
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
)(connect(mapStateToProps, mapDispatchToProps)(withTranslation()(withAuthorization(ContactPage))))
