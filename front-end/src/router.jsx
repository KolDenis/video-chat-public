import { createBrowserRouter } from "react-router-dom";
import Main from "./pages/Main/Main";
import Auth from "./pages/Auth/Auth";
import CodeExchange from "./pages/CodeExchange";
import NewMeet from "./pages/CreateMeet/NewMeet";
import Settings from "./pages/Settings/Settings";
import MeetPage from "./pages/Meet/MeetPage";
import GuestWrongPathComponent from "./pages/WrongPathComponent/GuestWrongPathComponent";
import UserWrongPathComponent from "./pages/WrongPathComponent/UserWrongpathComponent";

const authedRouter = createBrowserRouter([
    {
      path: "/",
      element: <Main/>,
    },
    {
      path: "/meet/:id",
      element: <MeetPage/>,
    },
    {
      path: "/newmeet",
      element: <NewMeet/>
    },
    {
      path: "/settings",
      element: <Settings/>
    },
    {
      path: '*',
      element: <UserWrongPathComponent/>,
    },
  ]);

  const guestRouter = createBrowserRouter([
    {
        path: "/auth",
        element: <Auth/>
    },
    {
        path: "/code",
        element: <CodeExchange/>
    },
    {
      path: '*',
      element: <GuestWrongPathComponent/>,
    }
  ]);

  export {authedRouter, guestRouter};