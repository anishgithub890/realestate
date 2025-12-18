import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Company {
  id: number;
  name: string;
}

interface CompanyState {
  currentCompany: Company | null;
  companies: Company[];
  loading: boolean;
}

const initialState: CompanyState = {
  currentCompany: null,
  companies: [],
  loading: false,
};

const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    setCompanies: (state, action: PayloadAction<Company[]>) => {
      state.companies = action.payload;
    },
    setCurrentCompany: (state, action: PayloadAction<Company>) => {
      state.currentCompany = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setCompanies, setCurrentCompany, setLoading } = companySlice.actions;
export default companySlice.reducer;

