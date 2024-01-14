import { EmailConfig } from "../../Schema";
import { EmailConfigAction } from "../actions";

interface EmailConfigState {
  emailConfig: EmailConfig | null;
  emailConfigLoading: boolean;
  updateEmailConfigLoading: boolean;
  deleteEmailConfigLoading: boolean;
  addEmailConfigLoading: boolean;
}

const initialState: EmailConfigState = {
  emailConfig: null,
  emailConfigLoading: true,
  updateEmailConfigLoading: false,
  deleteEmailConfigLoading: false,
  addEmailConfigLoading: false,
};

const settingsReducer = (
  state: EmailConfigState = initialState,
  action: EmailConfigAction
): EmailConfigState => {
  switch (action.type) {
    case "settings/GET_EMAIL_CONFIG":
      return {
        ...state,
        emailConfigLoading: true,
      };
    case "settings/GET_EMAIL_CONFIG_DONE":
      return {
        ...state,
        emailConfigLoading: false,
        emailConfig: action.config,
      };
    case "settings/UPDATE_EMAIL_CONFIG":
      return {
        ...state,
        updateEmailConfigLoading: true,
      };
    case "settings/UPDATE_EMAIL_CONFIG_DONE": {
      let emailConfig = state.emailConfig;
      if (action.config && action.config._id) {
        emailConfig = state.emailConfig;
      }
      return {
        ...state,
        updateEmailConfigLoading: false,
        emailConfig: emailConfig,
      };
    }
    case "settings/DELETE_EMAIL_CONFIG":
      return {
        ...state,
        deleteEmailConfigLoading: true,
      };
    case "settings/DELETE_EMAIL_CONFIG_DONE": {
      let emailConfig = state.emailConfig;
      if (action.id) {
        emailConfig = null;
      }
      return {
        ...state,
        deleteEmailConfigLoading: false,
        emailConfig: emailConfig,
      };
    }
    case "settings/ADD_EMAIL_CONFIG":
      return {
        ...state,
        addEmailConfigLoading: true,
      };
    case "settings/ADD_EMAIL_CONFIG_DONE": {
      return action.config?._id
        ? {
            ...state,
            addEmailConfigLoading: false,
            emailConfig: action.config,
          }
        : {
            ...state,
            addEmailConfigLoading: false,
          };
    }
    default:
      return state;
  }
};

export default settingsReducer;
