import { Dispatch } from "redux";
import { API_URL } from "../network/api";

const LOGIN = "auth/LOGIN" as const;
const LOGIN_DONE = "auth/LOGIN_DONE" as const;
const LOGIN_ERROR = "auth/LOGIN_ERROR" as const;
const LOGOUT = "auth/LOGOUT" as const;


export const login = () => ({
  type: LOGIN
});

export const loginDone = (data: any) => ({
  type: LOGIN_DONE,
  payload: data,
});

export const loginFaild = (data: any) => ({
    type: LOGIN_ERROR,
    payload: data,
});

export const logout = () => ({
  type: LOGOUT
});

export const loginRequest = (form: {email: string; password: string}) => {
  return async (dispatch: Dispatch) => {
    dispatch(login());

    try {
      const response = await fetch(`${API_URL}/auth/signin`, {
        method: "POST",
        body: JSON.stringify(form),
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();

      dispatch(loginDone(data.data));
      return data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      dispatch(loginDone(null));
      return null
    }
  };
};

export type AuthAction = ReturnType<
  typeof login | typeof loginDone | typeof loginFaild | typeof logout
>;
