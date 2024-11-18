import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Message{
    sender: string,
    text: string
}

export interface Chat{
	messages: Message[]
}

const initialState:Chat = {
    messages: []
}

export const chatSlice = createSlice({
	name: "chat",
	initialState,
	reducers:{
		newMessage: (state: Chat, action: PayloadAction<Message>) => {
			state.messages.push(action.payload);
		},
	}

});

export const {newMessage} = chatSlice.actions;