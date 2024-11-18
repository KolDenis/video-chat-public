import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppSelector } from "../../store";
import { useEffect } from "react";

const UserWrongPathComponent = () => {
    const location = useLocation();
    const currentPath = location.pathname;
    const navigate = useNavigate();
    
    useEffect(() =>{
        navigate("/");
    }, []);

    /*let message = "";
    if(currentPath.includes("/meet")){
        message = "You should provde id of meet";
    }else if(currentPath.includes("/Auth")){
        message = "You are already authenticated";
    }else{
        message = "Path is undefined";
    }*/

    return (
        <div>
            
        </div>
    );
}

export default UserWrongPathComponent;