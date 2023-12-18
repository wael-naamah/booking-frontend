import { Button, Col, Divider, Row } from 'antd';
import { Content } from 'antd/es/layout/layout';
import React from 'react';
import Logo from '../assets/bgas-logo.png'
import { selectLoggedIn } from '../redux/selectors';
import { RootState } from '../redux/store';
import { ThunkDispatch } from '@reduxjs/toolkit';
import { connect } from 'react-redux';
import { logout } from '../redux/actions';
import { Link } from 'react-router-dom';

interface IHeaderProps {
    loggedIn: boolean;
    logout: () => void;
}
class Header extends React.Component<IHeaderProps> {
    constructor(props: IHeaderProps) {
        super(props);
    }

    render() {
        const { logout, loggedIn } = this.props;
        return (
            <Content>
                <Row justify={'space-between'} className="flex items-center">
                    <Col>
                        <img src={Logo} width={135} height={50} />
                    </Col>
                    <Col>
                    {/* {loggedIn ? <Button onClick={() => logout()} >Logout</Button> : <Link to="/login">Login</Link>} */}
                    {!loggedIn ? null : <Button onClick={() => logout()} className="mr-1" type='link' >Logout</Button>}
                        <span>B-GAS GmbH | 01 / 202 85 56</span>
                    </Col>
                </Row>
                <Divider className='m-0 mt-5' />
            </Content>
        );
    }
}

const mapStateToProps = (state: RootState) => ({
    loggedIn: selectLoggedIn(state),
});

const mapDispatchToProps = (
    dispatch: ThunkDispatch<RootState, undefined, any>
) => ({
    logout: () => dispatch(logout()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Header)
