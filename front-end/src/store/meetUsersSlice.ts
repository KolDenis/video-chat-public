import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface MeetUser{
	id: string,
    name: string,
	trackSids: string[] | null,
}

export interface MeetUsers{
	users: MeetUser[] | null,
}

const initialState:MeetUsers = {
    users: []
}

export const meetUsersSlice = createSlice({
	name: "meetUsers",
	initialState,
	reducers:{
		set: (state: MeetUsers, action : PayloadAction<any>) => {
			state.users = action.payload;
		},
		newUser: (state: MeetUsers, action : PayloadAction<MeetUser>) => {
			state.users?.push(action.payload);
		},
		removeUser: (state: MeetUsers, action : PayloadAction<string>) => {
			if(!state.users) return;
			state.users = state.users.filter((user:MeetUser) => user.id != action.payload);
		},
		setDefaultPermissions: (state: MeetUsers, action : PayloadAction<string[]>) => {
			if(!state.users) return;

			state.users = state.users.map((user:MeetUser) => {
				return{
					...user,
					trackSids: action.payload
				}
			});
		},
		setPermission: (state: MeetUsers, action : PayloadAction<any>) => {
			if(!state.users) return;

			console.log(action.payload);

			state.users = state.users.map((user:MeetUser) => {
				if(user.id == action.payload.userId){
					return{
						...user,
						trackSids: action.payload.trackSids
					}
				}
				else{
					return user;
				}
			});
		},
	}

});

export const {set, newUser, removeUser, setPermission, setDefaultPermissions} = meetUsersSlice.actions;