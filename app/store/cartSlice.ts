
import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
    name: 'cart',
    initialState: [],
    reducers: {
        addToCart: (state, action) => {
            state.push(action.payload);
        },
        processCart: (state) => {
           
            return [];
        },
    },
});

export const { addToCart, processCart } = cartSlice.actions;
export const selectCart = (state) => state.cart;
export default cartSlice.reducer;