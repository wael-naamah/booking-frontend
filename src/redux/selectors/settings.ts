import { RootState } from '../store';

export const selectEmailConfig = (state: RootState) => state.settings.emailConfig;
export const selectEmailConfigLoading = (state: RootState) => state.settings.emailConfigLoading;

export const selectUpdateEmailConfigLoading = (state: RootState) => state.settings.updateEmailConfigLoading;
export const selectDeleteEmailConfigLoading = (state: RootState) => state.settings.deleteEmailConfigLoading;


