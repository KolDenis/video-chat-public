import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface User{
	isAuthed: boolean,
	id: string,
	name: string
}

const initialState:User = {
    isAuthed:false,
	id: "",
	name: ""
}

export const userSlice = createSlice({
	name: "user",
	initialState,
	reducers:{
		login: (state: User, action: PayloadAction<any>) => {
			state.isAuthed = true;
			state.id = action.payload.id;
			state.name = action.payload.name;
		},
		logout: (state: User) => {
			state.isAuthed = false;
		}
	}

});

export const {login, logout} = userSlice.actions;