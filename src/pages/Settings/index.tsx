import React from "react";
import { connect } from "react-redux";
import { RootState } from "../../redux/store";
import {
  fetchEmailConfig,
  updateEmailConfigRequest,
  deleteEmailConfigRequest,
  addEmailConfigRequest,
  fetchServices,
  fetchEmailTemplate,
  updateEmailTemplateRequest,
  addEmailTemplateRequest,
  deleteEmailTemplateRequest
} from "../../redux/actions";
import {
  selectEmailConfig,
  selectEmailConfigLoading,
  selectEmailTemplates,
  selectEmailTemplatesLoading,
  selectServices,
  selectServicesLoading,
} from "../../redux/selectors";
import { EmailConfig, EmailTemplate, EmailTemplateType, Service } from "../../Schema";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { Content } from "antd/es/layout/layout";
import {
  Button,
  Card,
  Col,
  Input,
  Popconfirm,
  Row,
  Select,
  Spin,
  Switch,
  Tabs,
  message,
} from "antd";
import TextArea from "antd/es/input/TextArea";

const { Option } = Select

interface ISettingsState {
  emailConfig: EmailConfig;
  subject: string;
  template: string;
  templateType: EmailTemplateType | null;
  emailTemplateId: string | null;
  serviceId: string | null;
}

interface ISettingsProps {
  loading: boolean;
  config: EmailConfig | null;
  services: Service[];
  servicesLoading: boolean;
  emailTemplates: EmailTemplate[];
  emailTemplatesLoading: boolean;
  fetchEmailConfig: () => Promise<EmailConfig | null>;
  updateEmailConfigRequest: (
    id: string,
    config: EmailConfig
  ) => Promise<EmailConfig | null>;
  deleteEmailConfigRequest: (id: string) => Promise<any>;
  addEmailConfigRequest: (config: EmailConfig) => Promise<any>;
  fetchServices: () => Promise<void>;
  fetchEmailTemplate: (type: string) => Promise<any>;
  updateEmailTemplateRequest: (
    id: string,
    template: EmailTemplate
  ) => Promise<EmailTemplate | null>;
  addEmailTemplateRequest: (template: EmailTemplate) => Promise<any>;
  deleteEmailTemplateRequest: (id: string) => Promise<any>;
}

class SettingsPage extends React.Component<ISettingsProps, ISettingsState> {
  constructor(props: ISettingsProps) {
    super(props);
    this.state = {
      emailConfig: {
        _id: undefined,
        sender: "",
        server: "",
        username: "",
        password: "",
        port: 0,
        ssl_enabled: false,
      },
      subject: "",
      template: "",
      templateType: null,
      emailTemplateId: null,
      serviceId: null
    };
  }

  formRef = React.createRef<any>();

  fetchData = () => {
    this.props.fetchEmailConfig().then((data) => {
      if (data && data._id) {
        this.setState({
          emailConfig: data,
        });
      }
    });
    this.props.fetchServices();
  };

  componentDidMount() {
    this.fetchData();
  }

  onDeleteConfig = (id: string) => {
    this.props.deleteEmailConfigRequest(id).then((data) => {
      if (data.status && data.status === "success") {
        message.success("Successfully deleted the config");
        this.setState({
          emailConfig: {
            _id: undefined,
            sender: "",
            server: "",
            username: "",
            password: "",
            port: 0,
            ssl_enabled: false,
          },
        });
      } else {
        message.error("Something went wrong. please try again");
      }
    });
  };

  onDeleteTemplate = (id: string) => {
    this.props.deleteEmailTemplateRequest(id).then((data) => {
      if (data.status && data.status === "success") {
        message.success("Successfully deleted the template");
        this.setState({
          emailTemplateId: null,
          subject: "",
          template: "",
        });
      } else {
        message.error("Something went wrong. please try again");
      }
    });
  };

  renderExtra = () => {
    const { emailConfig } = this.state;

    const onSave = () => {
      emailConfig._id
        ? this.props
          .updateEmailConfigRequest(emailConfig._id, {
            sender: emailConfig.sender,
            server: emailConfig.server,
            username: emailConfig.username,
            password: emailConfig.password,
            port: emailConfig.port,
            ssl_enabled: emailConfig.ssl_enabled,
          })
          .then((data) => {
            if (data && data._id) {
              message.success("Successfully updated the config");
            } else {
              message.error("Something went wrong. please try again");
            }
          })
        : this.props.addEmailConfigRequest(emailConfig).then((data) => {
          if (data && data._id) {
            message.success("Successfully saved the config");
          } else {
            message.error("Something went wrong. please try again");
          }
        });
    };

    return (
      <>
        <Button onClick={() => onSave()} type="primary">
          Save
        </Button>
        {emailConfig._id ? (
          <Popconfirm
            title="Delete email config?"
            description="Are you sure you want to delete the email configs?"
            okText="Delete It"
            cancelText="No"
            okButtonProps={{
              danger: true,
            }}
            onConfirm={() => this.onDeleteConfig(emailConfig._id!)}
          >
            <Button className="self-end ml-3" type="primary" danger>
              Delete
            </Button>
          </Popconfirm>
        ) : null}
      </>
    );
  };

  renderEmailConfig = () => {
    const { emailConfig } = this.state;
    const { loading } = this.props;

    const onChange = (key: string, value: boolean | string | number) => {
      this.setState({
        emailConfig: {
          ...emailConfig,
          [key]: value,
        },
      });
    };

    return (
      <Card title="Email Config" extra={this.renderExtra()}>
        <Spin spinning={loading}>
          <div className="w-full">
            <Row className="mb-6">
              <Col span={8} className="w-full">
                <span>E-mail address for test e-mail</span>
              </Col>
              <Col span={16}>
                <Input
                  onChange={(e) => {
                    onChange("sender", e.target.value);
                  }}
                  value={emailConfig?.sender}
                />
              </Col>
            </Row>

            <Row className="mb-6">
              <Col span={8} className="w-full">
                <span>E-mail server</span>
              </Col>
              <Col span={16}>
                <Input
                  onChange={(e) => {
                    onChange("server", e.target.value);
                  }}
                  value={emailConfig?.server}
                />
              </Col>
            </Row>

            <Row className="mb-6">
              <Col span={8} className="w-full">
                <span>User name</span>
              </Col>
              <Col span={16}>
                <Input
                  onChange={(e) => {
                    onChange("username", e.target.value);
                  }}
                  value={emailConfig?.username}
                />
              </Col>
            </Row>

            <Row className="mb-6">
              <Col span={8} className="w-full">
                <span>Password</span>
              </Col>
              <Col span={16}>
                <Input
                  onChange={(e) => {
                    onChange("password", e.target.value);
                  }}
                  type="password"
                  value={emailConfig?.password}
                />
              </Col>
            </Row>

            <Row className="mb-6">
              <Col span={8} className="w-full">
                <span>Port</span>
              </Col>
              <Col span={16}>
                <Input
                  onChange={(e) => {
                    onChange("port", e.target.value);
                  }}
                  type="number"
                  value={emailConfig?.port}
                />
              </Col>
            </Row>

            <Row className="mb-6">
              <Col span={8} className="w-full">
                <span>Server requires SSL encryption</span>
              </Col>
              <Col span={16}>
                <Switch
                  onChange={(value) => {
                    onChange("ssl_enabled", value);
                  }}
                  checked={emailConfig?.ssl_enabled}
                />
              </Col>
            </Row>
          </div>
        </Spin>
      </Card>
    )

  }

  renderEmailTamplate = () => {
    const { subject, template, templateType, emailTemplateId, serviceId } = this.state;
    const { services, servicesLoading } = this.props;

    const onTemplateTypeChange = (type: string) => {
      this.setState({ templateType: type as EmailTemplateType })
      this.props.fetchEmailTemplate(type).then(template => {
        if(type === EmailTemplateType.Cancellation && template && template.length){
          const data = template[0]
          this.setState({ emailTemplateId: data._id!, subject: data.subject, template: data.template })
        } else {
          this.setState({ emailTemplateId: null, subject: "", template: "" })
        }
      })
    }

    const onServiceChange = (id: string) => {
      this.setState({ serviceId: id })
      const template = this.props.emailTemplates.filter(el => el.service_id === id)
      if (template.length) {
        const data = template[0]
        this.setState({ emailTemplateId: data._id!, subject: data.subject, template: data.template })
      } else {
        this.setState({ emailTemplateId: null, subject: "", template: "" })
      }
    }

    const renderExtra = () => {
      const onSave = () => {
        if (!templateType || !subject || !template) {
          message.error("Please fill all data");
          return;
        }
        if (templateType === EmailTemplateType.Confirmation && !serviceId) {
          message.error("Please select the service");
          return;
        }

        const emailTemplate = templateType === EmailTemplateType.Cancellation ? {
          type: templateType,
          subject,
          template
        } : {
          type: templateType,
          subject,
          template,
          service_id: serviceId!
        }
        emailTemplateId
          ? this.props
            .updateEmailTemplateRequest(emailTemplateId, emailTemplate)
            .then((data) => {
              if (data && data._id) {
                message.success("Successfully updated the template");
              } else {
                message.error("Something went wrong. please try again");
              }
            })
          : this.props.addEmailTemplateRequest(emailTemplate).then((data) => {
            if (data && data._id) {
              message.success("Successfully saved the template");
            } else {
              message.error("Something went wrong. please try again");
            }
          });
      };

      return (
        <>
          <Button onClick={() => onSave()} type="primary">
            Save
          </Button>
          {emailTemplateId ? (
            <Popconfirm
              title="Delete email template?"
              description="Are you sure you want to delete the email template?"
              okText="Delete It"
              cancelText="No"
              okButtonProps={{
                danger: true,
              }}
              onConfirm={() => this.onDeleteTemplate(emailTemplateId)}
            >
              <Button className="self-end ml-3" type="primary" danger>
                Delete
              </Button>
            </Popconfirm>
          ) : null}
        </>
      );
    };


    return (
      <Card title="Set Email Templates" extra={renderExtra()}>
        <Row className="mb-6" gutter={[16, 16]}>
          <Col span={24}>
            <label>Type</label>
            <Select className="w-full" onChange={(value) => onTemplateTypeChange(value)}>
              {Object.values(EmailTemplateType).map((templateType) => (
                <Option key={templateType} value={templateType}>
                  {templateType}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>

        {templateType === EmailTemplateType.Confirmation ? <Row className="mb-6" gutter={[16, 16]}>
          <Col span={24}>
            <label>Service</label>
            <Select loading={servicesLoading} className="w-full" onChange={(value) => onServiceChange(value)}>
              {services.map((service) => (
                <Option key={service._id} value={service._id}>
                  {service.name + " (" + service.abbreviation_id + ")"}
                </Option>
              ))}
            </Select>
          </Col>
        </Row> : null}

        <Row className="mb-6" gutter={[16, 16]}>
          <Col span={24}>
            <label>Subject</label>
            <Input value={subject} onChange={(e) => this.setState({ subject: e.target.value })} />
          </Col>
        </Row>

        <Row className="mb-6" gutter={[16, 16]}>
          <Col span={24}>
            <label>Email</label>
            <TextArea style={{ height: 250 }} value={template} onChange={(e) => this.setState({ template: e.target.value })} />
          </Col>
        </Row>
      </Card>
    )
  }

  render() {

    return (
      <Content>
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: "1",
              label: "General",
              children: this.renderEmailConfig(),
            },
            {
              key: "2",
              label: "Email Tamplates",
              children: this.renderEmailTamplate(),
            }
          ]}
        />
      </Content>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  config: selectEmailConfig(state),
  loading: selectEmailConfigLoading(state),
  services: selectServices(state),
  servicesLoading: selectServicesLoading(state),
  emailTemplates: selectEmailTemplates(state),
  emailTemplatesLoading: selectEmailTemplatesLoading(state),
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<RootState, undefined, any>
) => ({
  fetchEmailConfig: () => dispatch(fetchEmailConfig()),
  updateEmailConfigRequest: (id: string, config: EmailConfig) =>
    dispatch(updateEmailConfigRequest(id, config)),
  deleteEmailConfigRequest: (id: string) =>
    dispatch(deleteEmailConfigRequest(id)),
  addEmailConfigRequest: (config: EmailConfig) =>
    dispatch(addEmailConfigRequest(config)),
  fetchServices: () => dispatch(fetchServices()),
  fetchEmailTemplate: (type: string) => dispatch(fetchEmailTemplate(type)),
  updateEmailTemplateRequest: (id: string, template: EmailTemplate) =>
    dispatch(updateEmailTemplateRequest(id, template)),
  addEmailTemplateRequest: (template: EmailTemplate) =>
    dispatch(addEmailTemplateRequest(template)),
  deleteEmailTemplateRequest: (id: string) =>
    dispatch(deleteEmailTemplateRequest(id)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SettingsPage);
