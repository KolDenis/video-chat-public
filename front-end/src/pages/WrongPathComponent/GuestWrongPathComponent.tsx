import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppSelector } from "../../store";
import { useEffect } from "react";

const GuestWrongPathComponent = () => {
    const location = useLocation(); // Отримуємо об'єкт location
    const currentPath = location.pathname;
    const navigate = useNavigate();
    
    useEffect(() =>{
        navigate("/Auth");
    }, []);

    return (
        <div>

        </div>
    );
}

export default GuestWrongPathComponent;