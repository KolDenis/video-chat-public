import { useEffect, useState } from "react";
import { useAppSelector } from "../../store"
import { useNavigate, useParams } from "react-router-dom";
import styles from "./Meet.module.scss";
import { usePopup } from "../../PopupProvider";
import WaitingRoom from "../../components/MeetComponents/WaitingRoom.tsx/WaitingRoom";
import Meet from "../../components/MeetComponents/Meet/Meet";

const MeetPage = () => {
    const user = useAppSelector(state => state.user);
    const { id } = useParams();
    const navigate = useNavigate();
    const { showPopup } = usePopup();
    const [isWaiting, setIsWaiting] = useState(true);
    const [permission, setSermission] = useState({video: true, audio: true});
    
    useEffect(() => {
        if(!id || !user.isAuthed){
            showPopup("warning", "You must be autorized and provide id of room!");
            navigate("/");
        }
    }, []);

    const Join = (video:boolean, audio:boolean) => {
        setIsWaiting(false);
        setSermission({video, audio})
    }

    return (
        <div className={styles.Meet}>

            {
                isWaiting 
                ?
                <WaitingRoom join={Join}/> 
                :
                <Meet permission={permission}/>
            }
        </div>
    )
}

export default MeetPage;