import React, { useState } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Button, theme } from "antd";
import "./index.css";
import { Outlet, useNavigate } from 'react-router-dom';
import Logo from '../../assets/bgas-logo.png'

const { Header, Sider, Content } = Layout;

const NavLink: React.FunctionComponent<{
  to: string;
  children: any;
  style?: React.CSSProperties;
  onClick?: () => any;
}> = ({ to, children, onClick, style }) => {
  const navigate = useNavigate();

  return (
    <div
      style={style}
      role="button"
      tabIndex={0}
      onClick={() => {
        if (onClick) onClick();
        navigate(to);
      }}
    >
      {children}
    </div>
  );
};

const SideBar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout className="">
      <Sider
        className={"sidebar"}
        trigger={null}
        collapsible
        collapsed={collapsed}
        color="#00203b"
      >
        <div className="demo-logo-vertical">
          <img src={Logo} alt="etermin-logo" width={collapsed ? 60 : 120} height={collapsed ? 25 : 50} />
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["1"]}
          items={[
            {
              key: "1",
              icon: <UserOutlined />,
              label: (
                <NavLink to={`/appointment`}>
                  <span className="title">
                    Appointment
                  </span>
                </NavLink>
              ),
            },
            {
              key: "2",
              icon: <VideoCameraOutlined />,
              label: <NavLink to={`/category`}>
                <span className="title">
                  Category
                </span>
              </NavLink>,
            },
            {
              key: "3",
              icon: <UploadOutlined />,
              label: "Company",
              children: [
                {
                  key: `sub1`,
                  label: <NavLink to={`/services`}>
                    <span className="title">
                      Services
                    </span>
                  </NavLink>,
                },
                {
                  key: `sub2`,
                  label: <NavLink to={`/calendar`}>
                    <span className="title">
                      Calendar
                    </span>
                  </NavLink>,
                },
                {
                  key: `sub3`,
                  label: <NavLink to={`/working-hours`}>
                    <span className="title">
                      Working Hours
                    </span>
                  </NavLink>,
                }
              ]
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
            }}
          />
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default SideBar;
