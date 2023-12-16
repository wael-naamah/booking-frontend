import { RootState } from '../store';

export const selectProfile = (state: RootState) => state.auth.profile;
export const selectLoginLoading = (state: RootState) => state.auth.loading;
