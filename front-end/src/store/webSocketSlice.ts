import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface WebSocketData{
	webSocket: WebSocket | null,
	isConnected: boolean
}

const initialState:WebSocketData = {
    webSocket: null,
	isConnected: false,
}

export const webSocketSlice = createSlice({
	name: "webSocket",
	initialState,
	reducers:{
		create: (state: WebSocketData, action: PayloadAction<string>) => {
			const webSocket = new WebSocket(`ws://localhost:5241/ws?roomId=${action.payload}`);
			webSocket.binaryType = 'arraybuffer';

			state.webSocket = webSocket;
		},
		setConnected: (state: WebSocketData, action: PayloadAction<boolean>) => {
			state.isConnected = action.payload;
		},
	}
});

export const {create, setConnected} = webSocketSlice.actions;