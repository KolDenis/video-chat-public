import { applyMiddleware, combineReducers, configureStore, createStore } from "@reduxjs/toolkit";
import { userSlice } from "./userSlice";
import { useDispatch, useSelector } from "react-redux";
import { webSocketSlice } from "./webSocketSlice";
import { meetUsersSlice } from "./meetUsersSlice";
import { chatSlice } from "./chatSlice";

export const store = createStore(
	combineReducers({
        user: userSlice.reducer,
        webSocket: webSocketSlice.reducer,
        meetUsers: meetUsersSlice.reducer,
        chat: chatSlice.reducer
    })
);

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppSelector = useSelector.withTypes<AppState>();
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
