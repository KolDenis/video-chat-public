import { RouterProvider, useNavigate } from 'react-router-dom';
import './App.css';
import { authedRouter, guestRouter } from './router';
import { useAppDispatch, useAppSelector } from './store';
import { useEffect, useState } from 'react';
import { isAuthed } from './api';
import { login, logout } from './store/userSlice';

function App() {
  const dispatch = useAppDispatch();
  const userAuthed = useAppSelector(state => state.user.isAuthed);
  const [userDataReceived, setReceived] = useState<boolean>(false);

  useEffect(() => {
    isAuthed().then((res:any) => {
      if(res.data.authed == true){
        dispatch(login(res.data.user));
      }
      else{
        dispatch(logout());
      }
      console.log(res.data);
    }).catch((error) => {
      console.log(error);
      dispatch(logout());
    }).finally(() => {
      setReceived(true)
    })
  }, []);
  
  return (
    <div className="App">
      {
        userDataReceived &&
        <RouterProvider router={userAuthed ? authedRouter : guestRouter}/>
      }
    </div>
  );
}


export default App;
