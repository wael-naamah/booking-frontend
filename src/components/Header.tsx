import { Col, Divider, Row, Select, Tooltip } from "antd";
import { Content } from "antd/es/layout/layout";
import { LogoutOutlined, LoginOutlined, UserOutlined, HomeOutlined, CalendarOutlined } from "@ant-design/icons";
import React from "react";
import Logo from "../assets/bgas-logo.png";
import { selectLoggedIn, selectProfile } from "../redux/selectors";
import { RootState } from "../redux/store";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { connect } from "react-redux";
import { logoutRequest } from "../redux/actions";
import { Link } from "react-router-dom";
import { withTranslation } from "react-i18next";
import i18n from "../locales/i18n";

const { Option } = Select;
interface IHeaderProps {
  loggedIn: boolean;
  logout: () => void;
  profile: any;
}
class Header extends React.Component<IHeaderProps> {
  constructor(props: IHeaderProps) {
    super(props);
  }

  render() {
    const { logout, loggedIn, profile } = this.props;
    const onSelectLang = (lang: string) => {
      i18n.changeLanguage(lang);
    }
    
    return (
      <Content>
        <Row justify={"space-between"} className="flex items-center">
          <Col>
            <img src={Logo} width={135} height={50} />
          </Col>
          <Col>
            {loggedIn ? (
              <Tooltip title={i18n.t("logout")}>
                <LogoutOutlined style={{ color: "#08c" }} className="text-lg" onClick={() => logout()} />
              </Tooltip>
            ) : (
              <Link to="/login">
                <Tooltip title={i18n.t("login")}>
                  <LoginOutlined style={{ color: "#08c" }} className="text-lg" />
                </Tooltip>
              </Link>
            )}
            {profile && profile.role === "contact" ? (
              <>
                <Link to="/profile">
                  <Tooltip title={i18n.t("profile")}>
                    <UserOutlined style={{ color: "#08c" }} className="text-lg ml-4" />
                  </Tooltip>
                </Link>
                <Link to="/contact-calendar">
                  <Tooltip title={i18n.t("appointments")}>
                    <CalendarOutlined style={{ color: "#08c" }} className="text-lg ml-4" />
                  </Tooltip>
                </Link>
                <Link to="/category">
                  <Tooltip title={i18n.t("category")}>
                    <HomeOutlined style={{ color: "#08c" }} className="text-lg ml-4" />
                  </Tooltip>
                </Link>
              </>
            ) : null}
            <Select defaultValue={'de'} className="ml-2" onChange={(value) => onSelectLang(value)}>
              <Option key={'en'} value='en'>En</Option>
              <Option key={'de'} value='de'>De</Option>
            </Select>
            <span className="ml-4">B-GAS GmbH | 01 / 202 85 56</span>
          </Col>
        </Row>
        <Divider className="m-0 mt-5" />
      </Content>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  loggedIn: selectLoggedIn(state),
  profile: selectProfile(state),
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<RootState, undefined, any>
) => ({
  logout: () => dispatch(logoutRequest()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation()(Header));
