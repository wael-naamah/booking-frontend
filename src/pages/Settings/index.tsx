import React from "react";
import { connect } from "react-redux";
import { RootState } from "../../redux/store";
import {
  fetchEmailConfig,
  updateEmailConfigRequest,
  deleteEmailConfigRequest,
  addEmailConfigRequest,
} from "../../redux/actions";
import {
  selectEmailConfig,
  selectEmailConfigLoading,
} from "../../redux/selectors";
import { EmailConfig } from "../../Schema";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { Content } from "antd/es/layout/layout";
import {
  Button,
  Card,
  Col,
  Input,
  Popconfirm,
  Row,
  Spin,
  Switch,
  message,
} from "antd";

interface ISettingsState {
  emailConfig: EmailConfig;
}

interface ISettingsProps {
  loading: boolean;
  config: EmailConfig | null;
  fetchEmailConfig: () => Promise<EmailConfig | null>;
  updateEmailConfigRequest: (
    id: string,
    config: EmailConfig
  ) => Promise<EmailConfig | null>;
  deleteEmailConfigRequest: (id: string) => Promise<any>;
  addEmailConfigRequest: (config: EmailConfig) => Promise<any>;
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

  render() {
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
      <Content>
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
      </Content>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  config: selectEmailConfig(state),
  loading: selectEmailConfigLoading(state),
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
});

export default connect(mapStateToProps, mapDispatchToProps)(SettingsPage);
