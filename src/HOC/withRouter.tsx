import React from 'react';
import { useNavigate } from 'react-router-dom';

interface withRouterProps {
  navigate?: (route: string) => void;
}

const withRouter = <P extends object>(Component: React.ComponentType<P>) => {
  const Wrapper: React.FC<P & withRouterProps> = (props) => {
    const navigate = useNavigate();

    return <Component {...props as P} navigate={navigate} />;
  };

  return Wrapper;
};

export default withRouter;
