import React, { ChangeEvent } from "react";
import { connect } from "react-redux";
import { RootState } from "../redux/store";
import { loginRequest } from "../redux/actions";
import { selectLoginLoading } from "../redux/selectors";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { Content } from "antd/es/layout/layout";
import { Input, Button, Form, message } from 'antd';
import withRouter from "../HOC/withRouter";
import { compose } from 'redux'

interface ILoginState {
    email: string;
    password: string;
}

interface ILoginProps {
    loading: boolean;
    login: (form: { email: string, password: string }) => Promise<any>;
    navigate?: (route: string) => void;
}

class LoginPage extends React.Component<ILoginProps, ILoginState> {
    constructor(props: ILoginProps) {
        super(props);
        this.state = {
            email: '',
            password: '',
        };
    }

    handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        this.setState({ [e.target.name]: e.target.value } as any);
    };

    handleLogin = () => {
        const { email, password } = this.state;

        this.props.login({ email, password }).then(data => {
          if(data && data._id){
            if (this.props.navigate)
            this.props.navigate('/calendar')
          } else if(data && data.message){
            message.error(data.message)
          }
        });
    };

    render() {
        const { email, password } = this.state;
        const { loading } = this.props;
        console.log('email', email)
        console.log('password', password)

        return (
            <div className="flex items-center justify-center h-screen">
            <Form
              layout="vertical"
              onFinish={this.handleLogin}
              className="bg-white-100 p-12 rounded shadow-md w-1/3"
            >
              <Form.Item label="Email" rules={[{ required: true, message: 'Please input your email!' }]}>
                <Input type="email" value={email} name="email" onChange={this.handleInputChange} className="w-full p-3" />
              </Form.Item>
              <Form.Item label="Password"  rules={[{ required: true, message: 'Please input your password!' }]}>
                <Input type="password" name="password" value={password} onChange={this.handleInputChange} className="w-full p-3" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} className="w-full py-3 flex items-center justify-center">
                  Login
                </Button>
              </Form.Item>
            </Form>
          </div>
        );
    }
}

const mapStateToProps = (state: RootState) => ({
    loading: selectLoginLoading(state),
});

const mapDispatchToProps = (
    dispatch: ThunkDispatch<RootState, undefined, any>
) => ({
    login: (form: { email: string; password: string }) => dispatch(loginRequest(form)),
});

export default compose(
  withRouter,
)(connect(mapStateToProps, mapDispatchToProps)(LoginPage))
