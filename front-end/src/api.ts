import axios from 'axios';

export const host = "http://localhost:6080/"

export function GetUrl():Promise<any>{
    const res = axios.get(host + "OAuth/GetUrl", {withCredentials: true})
    return res;
} 

export function getCode(code: string):Promise<any>{
    const params = {
        code: code,
    };
    const res = axios.post(host + "OAuth/Code", {}, {params, withCredentials: true  })
    return res;
}

export function createRoom(meetID: string):Promise<any>{
    const res = axios.post(host + "Rooms/createRoom", {}, {
        withCredentials: true,
        params: {meetID} })
    return res;
}

export function isAuthed():Promise<any>{
    const res = axios.get(host + "isAuthed", {
        withCredentials: true
    })
    return res;
}

export function getToken() {
    const res = axios.post(host + "token", {}, {withCredentials: true})
    return res;
}

export function loginByCredentials(email: string, password: string) {
    const res = axios.post(host + "OAuth/loginByCredentials", {},{
        withCredentials: true,
        params: {email, password}
    })
    return res;
}

export function registerByCredentials(name: string, email: string, password: string) {
    const res = axios.post(host + "OAuth/registerByCredentials", {},{
        withCredentials: true,
        params: {name, email, password}
    })
    return res;
}

export function CheckMeetByID(meetID:string):Promise<any>{
    const res = axios.get(host + "Rooms/CheckMeetByID",{
        withCredentials: true,
        params: {meetID}
    })
    return res;
}

export function getUserCredentialsByID() :Promise<any>{
    const res = axios.get(host + "OAuth/getUserCredentialsByID",{
        withCredentials: true
    })
    return res;   
}

export function changeUserCredentialsByID(newName:string, newEmail:string, newPassword:string) :Promise<any>{
    const res = axios.post(host + "OAuth/changeUserCredentialsByID", {}, {
        withCredentials: true,
        params: {newName, newEmail, newPassword}
    })
    return res;   
}