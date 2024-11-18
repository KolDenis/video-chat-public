import { useNavigate } from "react-router-dom";
import styles from "./NewMeet.module.scss";
import { useState } from "react";
import { CheckMeetByID, createRoom } from "../../api";
import { usePopup } from "../../PopupProvider";

const NewMeet = () => {
    const [isBusy, setBusyStatus] = useState<boolean>(false);
    const navigate = useNavigate();
    const [meetId, setMeetID] = useState<string>("");
    const {showPopup} = usePopup();

    function changeMeetId(event:any){
        setMeetID(event.target.value);
        setBusyStatus(false);
    }

    function clickGenerateId(){
        const randomNumber = Math.floor(Math.random() * 100000).toString().padStart(5, '0').toLocaleLowerCase().toString();
        setMeetID(randomNumber);  
    };

    function clickCreateNewMeet() {

        CheckMeetByID(meetId).then((res) => {
            const isBusyStatus = res.data.isAlive;
            setBusyStatus(isBusyStatus);

            if (isBusyStatus) {
                showPopup("Room is busy", "Room is busy");
            }else{
                createRoom(meetId).then((res) => {
                    
                    if (res.data.roomID != null) {
                        navigate("/meet/"+ meetId);
                    }else
                    {
                        showPopup("Creating error", "Room didn't created");
                    }
                }).catch((err) => {
                    showPopup("server message", err.message);
                });
            }
        }).catch((err) => {
            showPopup("server message", err.message);
        })
    };

    return (
        <div className={styles.Main}>
            <div className={styles.container}>
                <div className={styles.logo}>
                    <img alt="Meetik Logo" height="100" src="Gomer.gif" width="200" />
                </div>
                <h2>
                    Нова зустріч
                </h2>
                <div className={styles.form_group}>
                    <input id="MeetIdInput" className={!isBusy ? styles.input : styles.input_failed} placeholder="Створіть код зустрічі" 
                    type="text" value={meetId} onChange={changeMeetId}/>
                    <button onClick={clickGenerateId} className={styles.btn_generate}>
                        Згенерувати
                    </button>
                </div>
                <div className={styles.video_controls}>
                    <i className={styles.fa_video}>
                    </i>
                    <i className={styles.fa_microphone}>
                    </i>
                </div>
                <button onClick={clickCreateNewMeet} className={styles.btn_blue}>
                    Створити зустріч
                </button>
            </div>
        </div>
    )
}
export default NewMeet;