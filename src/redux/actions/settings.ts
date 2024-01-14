import { EmailConfig } from "../../Schema";
import { Dispatch } from "redux";
import { API_URL } from "../network/api";

const GET_EMAIL_CONFIG = "settings/GET_EMAIL_CONFIG" as const;
const GET_EMAIL_CONFIG_DONE = "settings/GET_EMAIL_CONFIG_DONE" as const;
const UPDATE_EMAIL_CONFIG = "settings/UPDATE_EMAIL_CONFIG" as const;
const UPDATE_EMAIL_CONFIG_DONE = "settings/UPDATE_EMAIL_CONFIG_DONE" as const;
const DELETE_EMAIL_CONFIG = "settings/DELETE_EMAIL_CONFIG" as const;
const DELETE_EMAIL_CONFIG_DONE = "settings/DELETE_EMAIL_CONFIG_DONE" as const;
const ADD_EMAIL_CONFIG = "settings/ADD_EMAIL_CONFIG" as const;
const ADD_EMAIL_CONFIG_DONE = "settings/ADD_EMAIL_CONFIG_DONE" as const;

export const addEmailConfig = () => ({
  type: ADD_EMAIL_CONFIG,
});

export const addEmailConfigDone = (config: EmailConfig | null) => ({
  type: ADD_EMAIL_CONFIG_DONE,
  config,
});

export const deleteEmailConfig = () => ({
  type: DELETE_EMAIL_CONFIG,
});

export const deleteEmailConfigDone = (id: string | null) => ({
  type: DELETE_EMAIL_CONFIG_DONE,
  id,
});

export const updateEmailConfig = () => ({
  type: UPDATE_EMAIL_CONFIG,
});

export const updateEmailConfigDone = (config: EmailConfig | null) => ({
  type: UPDATE_EMAIL_CONFIG_DONE,
  config,
});

export const getEmailConfig = () => ({
  type: GET_EMAIL_CONFIG,
});

export const getEmailConfigDone = (data: EmailConfig | null) => ({
  type: GET_EMAIL_CONFIG_DONE,
  config: data,
});

export const fetchEmailConfig = () => {
  return async (dispatch: Dispatch) => {
    dispatch(getEmailConfig());

    try {
      const response = await fetch(
        `${API_URL}/mailer/config`
      );
      const data = await response.json();

      if(data && data.length){
          dispatch(getEmailConfigDone(data[0]));
          return data[0];
      } else {
        dispatch(getEmailConfigDone(null));
        return null;
      }

    } catch (error) {
      console.error("Error fetching settings:", error);
      dispatch(getEmailConfigDone(null));
    }
  };
};

export const updateEmailConfigRequest = (id: string, config: EmailConfig) => {
  return async (dispatch: Dispatch) => {
    dispatch(updateEmailConfig());

    try {
      const response = await fetch(`${API_URL}/mailer/config/${id}`, {
        method: "PUT",
        body: JSON.stringify(config),
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();

      dispatch(updateEmailConfigDone(data));
      return data;
    } catch (error) {
      console.error("Error fetching settings:", error);

      dispatch(updateEmailConfigDone(null));
    }
  };
};

export const deleteEmailConfigRequest = (id: string) => {
  return async (dispatch: Dispatch) => {
    dispatch(deleteEmailConfig());

    try {
      const response = await fetch(`${API_URL}/mailer/config/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.status && data.status === "success")
        dispatch(deleteEmailConfigDone(id));
      else {
        dispatch(deleteEmailConfigDone(null));
      }
      return data;
    } catch (error) {
      console.error("Error fetching settings:", error);

      dispatch(deleteEmailConfigDone(null));
    }
  };
};

export const addEmailConfigRequest = (config: EmailConfig) => {
  return async (dispatch: Dispatch) => {
    dispatch(addEmailConfig());

    try {
      const response = await fetch(`${API_URL}/mailer/config`, {
        method: "POST",
        body: JSON.stringify(config),
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();

      dispatch(addEmailConfigDone(data));
      return data;
    } catch (error) {
      console.error("Error fetching settings:", error);

      dispatch(addEmailConfigDone(null));
    }
  };
};

export type EmailConfigAction = ReturnType<
  | typeof getEmailConfig
  | typeof getEmailConfigDone
  | typeof updateEmailConfig
  | typeof updateEmailConfigDone
  | typeof deleteEmailConfig
  | typeof deleteEmailConfigDone
  | typeof addEmailConfig
  | typeof addEmailConfigDone
>;
