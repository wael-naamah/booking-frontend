import React, { ComponentType } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectLoginLoading, selectProfile } from '../redux/selectors';
import { Spin } from 'antd';

interface AuthorizationProps {

}

const checkUserAccess = (profile: any, allowedRoles: string[] = []) => {
    console.log('profile', profile)
    console.log('allowedRoles', allowedRoles)

    if(!profile){
        return false;
    }
    if (allowedRoles.length) {
        const userRole = profile.role;
        return allowedRoles.includes(userRole);
    } else {
        return true
    }

}

const withAuthorization = <P extends AuthorizationProps>(
    Component: ComponentType<P>,
    allowedRoles?: string[]
) => {
    const WithAuthorization: React.FC<P> = (props) => {
        const navigate = useNavigate();

        const profile = useSelector(selectProfile);
        const loading = useSelector(selectLoginLoading);


        if (loading) {
            return <Spin spinning={loading} />;
        }

        const hasAccess = checkUserAccess(profile, allowedRoles);
        if (!hasAccess) {
            console.log('hasAccess');
            navigate('/login', { replace: true }); // Or redirect to an unauthorized page
            // return null; // You can also render an unauthorized message or component
        }

        return <Component {...props} />;
    };

    return WithAuthorization;
};

export default withAuthorization;
