import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FilterSliceState {
    id: number,
    categoryID: number,
    selectedCategoryName: string | null,
    searchValue: string,
    adminSearchValue: string,
    adminCategoryID: number,
    adminSelectedCategoryName: string | null,

}
const initialState: FilterSliceState = {
    id: 1,
    categoryID: 0,
    selectedCategoryName: null,
    searchValue: '',

    adminCategoryID: 0,
    adminSelectedCategoryName: null,
    adminSearchValue: ''
}

const filterSlice = createSlice({
    name: 'filter',
    initialState,
    reducers: {
        setCategory(state, action: PayloadAction<{ id: number, name: string }>) {
            state.categoryID = action.payload.id;
            state.selectedCategoryName = action.payload.id === 0 ? null : action.payload.name;
        },
        setSearch(state, action: PayloadAction<string>) {
            state.searchValue = action.payload;
        },
        setAdminSearch(state, action: PayloadAction<string>) {
            state.adminSearchValue = action.payload;
        },
        setAdminCategory(state, action: PayloadAction<{ id: number, name: string }>) {
            state.adminCategoryID = action.payload.id;
            state.adminSelectedCategoryName = action.payload.id === 0 ? null : action.payload.name;
        },
        setProductId(state, action) {
            state.id = action.payload
        }
    }
});

export const { setSearch, setCategory, setAdminCategory, setAdminSearch } = filterSlice.actions;

export default filterSlice.reducer