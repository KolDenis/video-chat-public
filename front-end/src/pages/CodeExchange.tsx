import React, { useEffect }from 'react'
import {useLocation, useNavigate} from 'react-router-dom';
import { getCode} from '../api';
import { useAppDispatch, useAppSelector } from '../store';
import { login, logout } from '../store/userSlice';

const CodeExchange = () => {
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(useLocation().search);
    const code = searchParams.get('code');
    const isAuthed = useAppSelector(state => state.user.isAuthed);
    const dispatch = useAppDispatch();

    useEffect(()=>{
        if(isAuthed){
            navigate("/");
            return;
        }
        if(code){
            getCode(code).then((res:any) => {
                if(res.data.authed == true){
                    dispatch(login(res.data.user));
                    navigate("/");
                }else{
                    dispatch(logout());
                navigate("/");
                }
            }).catch((err) => {
                dispatch(logout());
                navigate("/");
            })
        }
        else{
            navigate("/");
        }

    }, [])

    return (
        <div>Авторизация...</div>
    )
}

export default CodeExchange;