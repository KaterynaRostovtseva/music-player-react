import { createSlice} from '@reduxjs/toolkit';


const searchSlice = createSlice({
    name: 'search',
    initialState: { searchTracks: null },
    reducers: {
      setSearchResults(state, action) {
        state.searchTracks = action.payload;
      },
    },
  });
  
  export const { setSearchResults } = searchSlice.actions;
  export default searchSlice.reducer;

