import React from "react";
import { debounce } from "lodash";
import { connect } from "react-redux";
import { RootState } from "../../redux/store";
import {
  fetchContacts,
  createContactRequest,
  deleteContactRequest,
  updateContactRequest,
  importContactsRequest,
  resetContactPasswordManually
} from "../../redux/actions";
import { selectContacts, selectContactsLoading } from "../../redux/selectors";
import { Contact, PaginatedForm } from "../../Schema";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { compose } from 'redux'
import {
  Button,
  Card,
  Col,
  Divider,
  Dropdown,
  Form,
  Input,
  Menu,
  Modal,
  Pagination,
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Upload,
  message,
} from "antd";
import withRouter from "../../HOC/withRouter";
import { withTranslation } from 'react-i18next';
import i18n from "../../locales/i18n";
import withAuthorization from "../../HOC/withAuthorization";
import { RcFile } from "antd/es/upload";
import { API_URL } from "../../redux/network/api";
import { EllipsisOutlined } from '@ant-design/icons';

const { Column } = Table;
const { Option } = Select;

interface IContactState {
  visible: boolean;
  resetVisible: boolean;
  pageNum: number;
  totalCount: number;
  pageCount: number;
  currentPage: number;
  editingContactId: string | null;
  search: string;
  importModelVisible: boolean;
  importLoading: boolean;
  exportLoading: boolean;
  file?: RcFile;
  newPassword?: string;
}

interface IContactProps {
  loading: boolean;
  fetchContacts: (form: PaginatedForm) => Promise<any>;
  createContactRequest: (contact: Contact) => Promise<any>;
  deleteContactRequest: (id: string) => Promise<any>;
  resetContactPasswordManually: (id: string, password: string) => Promise<any>;
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
      search: '',
      importModelVisible: false,
      importLoading: false,
      exportLoading: false,
      resetVisible: false,
    };
  }

  formRef = React.createRef<any>();

  fetchData = () => {
    const { pageNum, pageCount, search } = this.state;

    this.props.fetchContacts({ page: pageNum, limit: pageCount, search }).then((data) => {
      if (data?.metaData?.totalItems) {
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
  debounceSearch = debounce((value: string) => {
    this.fetchData();
  }, 1000);
  onSearch = (value: string) => {
    this.setState({ pageNum: 1, search: value });
    this.debounceSearch(value);
  }

  onOpen = (contactId: string | null = null) => {
    this.setState({ visible: true, editingContactId: contactId });
  };

  onOpenResetPassword = (contactId: string) => {
    this.setState({ resetVisible: true, editingContactId: contactId });
  };

  onOpenImportModel = () => {
    this.setState({ importModelVisible: true });
  };

  onExportContacts = () => {
    this.setState({ exportLoading: true });
    window.open(`${API_URL}/files/export-contacts-file`, '_blank');
    this.setState({ exportLoading: true });
  }

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
                    { lable: i18n.t('mr'), value: i18n.t('mr') },
                    { lable: i18n.t('mrs'), value: i18n.t('mrs') },
                    { lable: i18n.t('company'), value: i18n.t('company') },
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
            <Button className="mr-3" onClick={onClose}>{i18n.t('cancel')}</Button>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                {i18n.t('save')}
              </Button>
            </Form.Item>
          </Row>
        </Form>
      </Modal>
    );
  };

  renderResetPasswordModal = () => {
    const { resetVisible, editingContactId } = this.state;

    const onClose = () => {
      this.setState({ resetVisible: false });
    };

    const onResetPassword = () => {
      if (editingContactId && this.state.newPassword) {
        this.props.resetContactPasswordManually(editingContactId, this.state.newPassword).then((data) => {
          if (data?.messege) {
            message.success(i18n.t('successfully_updated_the_data'));
          } else {
            message.error(i18n.t('something_went_wrong_please_try_again'));
          }
        }).catch(err => {
          message.error(i18n.t('something_went_wrong_please_try_again'));
        }).finally(() => {
          this.setState({ resetVisible: false });
        });
      }
    };

    return (
      <Modal
        title={i18n.t('reset_password')}
        open={resetVisible}
        centered
        closable={false}
        footer={() => null}
        width={800}
      >
        <Divider />
        <Row gutter={16}>
          <Col span={24}>
            <label>{i18n.t('new_password')}</label>
            <Input className="mt-3" value={this.state.newPassword} onChange={(e) => this.setState({ newPassword: e.target.value })} />
          </Col>
        </Row>
        <Divider />
        <Row gutter={16} justify={"end"}>
          <Button onClick={onClose}>{i18n.t('cancel')}</Button>
          <Popconfirm
            title={i18n.t('reset_password_for_this_contact')}
            description={i18n.t('are_you_sure_you_want_to_reset_password_for_this_contact')}
            okText={i18n.t('send_it')}
            cancelText={i18n.t('no')}
            okButtonProps={{
              danger: true,
            }}
            onConfirm={onResetPassword}
          >
            <Button type="primary" className="ml-3">{i18n.t('save')}</Button>
          </Popconfirm>
        </Row>
      </Modal>
    );
  };

  renderImportContactsModel = () => {
    const { importModelVisible, file } = this.state;

    const onClose = () => {
      this.setState({ importModelVisible: false });
    };

    const onFinish = () => {
      if (!this.state.file) return message.error(i18n.t('please_select_a_file'));

      this.setState({ importLoading: true });
      importContactsRequest(this.state.file).then((data) => {
        if (data?.status && data?.status === "success") {
          message.success(data?.message);
        } else {
          message.error(i18n.t('something_went_wrong_please_try_again'));
        }
      }).finally(() => {
        this.setState({ importModelVisible: false, importLoading: false });
      });
    };

    const setFile = (file?: RcFile) => {
      this.setState({ file })
    }

    return (
      <Modal
        title={i18n.t('import_contacts')}
        open={importModelVisible}
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
        >
          <Row gutter={16}>
            <Col span={24}>
              <Upload.Dragger
                fileList={file ? [file] : []}
                maxCount={1}
                multiple={false}
                onRemove={() => {
                  setFile(undefined);
                }}
                beforeUpload={(file) => {
                  setFile(file);
                  return false;
                }}
              >
                <Space size={14} align="center" className="m-0">
                  <p className="upload-hint-label">
                    {i18n.t('import_contacts')}
                  </p>
                </Space>
              </Upload.Dragger> 
            </Col>
          </Row>
          <Divider className="mb-4 mt-2" />
          <Row gutter={16} justify={"end"}>
            <Button onClick={onClose}>{i18n.t('cancel')}</Button>
            <Form.Item>
              <Button loading={this.state.importLoading} type="primary" className="ml-2" htmlType="submit">
                {i18n.t('save')}
              </Button>
            </Form.Item>
          </Row>
        </Form>
      </Modal>
    );
  }

  render() {
    const { pageNum, totalCount, currentPage, pageCount, visible, importModelVisible, importLoading, exportLoading, search, resetVisible } = this.state;
    const { loading, contacts } = this.props;

    return (
      <>
        {visible ? this.renderNewContactModal() : null}
        {resetVisible ? this.renderResetPasswordModal() : null}
        {importModelVisible ? this.renderImportContactsModel() : null}
        <Card
          title={i18n.t('contacts')}
          extra={
            <>
              <Input.Search
                placeholder={i18n.t('search_contacts')}
                style={{ width: '350px' }}
                value={search}
                onChange={(e) => {
                  this.onSearch(e.target.value);
                }}
                className="machine-list-search"
              />
              <Button className="ml-2" loading={importLoading} onClick={() => this.onOpenImportModel()} type="primary">
                {i18n.t('import_contacts')}
              </Button>
              <Button className="ml-2" loading={exportLoading} onClick={() => this.onExportContacts()} type="primary">
                {i18n.t('export_contacts')}
              </Button>
              <Button className="ml-2" onClick={() => this.onOpen()} type="primary">
                {i18n.t('new_contact')}
              </Button>
            </>
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
                  <Dropdown
                    overlay={
                      <Menu>
                        <Menu.Item key="edit" onClick={() => this.onOpen(record._id)}>
                          {i18n.t('edit')}
                        </Menu.Item>
                        <Menu.Item key="delete">
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
                            <span>{i18n.t('delete')}</span>
                          </Popconfirm>
                        </Menu.Item>
                        <Menu.Item key="sendCredentials" onClick={() => this.onOpenResetPassword(record._id!)} >
                          {i18n.t('reset_password')}
                        </Menu.Item>
                      </Menu>
                    }
                    placement="bottomRight"
                    trigger={['click']}
                  >
                    <Button>
                      <EllipsisOutlined />
                    </Button>
                  </Dropdown>
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
  fetchContacts: (form: PaginatedForm) =>
    dispatch(fetchContacts(form)),
  createContactRequest: (contact: Contact) =>
    dispatch(createContactRequest(contact)),
  deleteContactRequest: (id: string) => dispatch(deleteContactRequest(id)),
  resetContactPasswordManually: (id: string, password: string) => dispatch(resetContactPasswordManually(id, password)),
  updateContactRequest: (id: string, contact: Contact) =>
    dispatch(updateContactRequest(id, contact)),
});

export default compose(
  withRouter,
)(connect(mapStateToProps, mapDispatchToProps)(withTranslation()(withAuthorization(ContactPage))))
