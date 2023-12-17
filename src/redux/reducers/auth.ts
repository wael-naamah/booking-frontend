import { AuthAction } from "../actions";

interface AuthState {
  profile: any;
  loggedIn: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  profile: null,
  loggedIn: false,
  loading: false,
};

const authReducer = (
  state: AuthState = initialState,
  action: AuthAction
): AuthState => {
  switch (action.type) {
    case "auth/LOGIN":
      return {
        ...state,
        loading: true,
      };
    case "auth/LOGIN_DONE":
      return {
        ...state,
        loading: false,
        loggedIn: true,
        profile: action.payload,
      };
      case "auth/LOGIN_ERROR":
      return {
        ...state,
        loading: false,
        loggedIn: false,
        profile: null,
      };
      case "auth/LOGOUT":
        return {
        ...state,
        loggedIn: false,
        profile: null,
        }
    default:
      return state;
  }
};

export default authReducer;
