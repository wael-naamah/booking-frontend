import { Col, Divider, Row } from 'antd';
import { Content } from 'antd/es/layout/layout';
import React from 'react';
import Logo from '../assets/bgas-logo.png'



class Header extends React.Component {

    render() {
        return (
            <Content>
                <Row justify={'space-between'} className="flex items-center">
                    <Col>
                        <img src={Logo} width={135} height={50} />
                    </Col>
                    <Col>
                        <span>B-GAS GmbH | 01 / 202 85 56</span>
                    </Col>
                </Row>
                <Divider className='m-0 mt-5'/>
            </Content>
        );
    }
}

export default Header;