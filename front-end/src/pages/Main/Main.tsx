import { GetUrl } from "../../api";
import { Navigate, useNavigate } from "react-router-dom";
import VideoStream from "../../components/VideoStream/VideoStream";
import { useAppSelector } from "../../store";
import styles from "./Main.module.scss";
import { useEffect, useState } from "react";
import { CheckMeetByID } from "../../api";

const Main = () => {
	const isAuthed = useAppSelector(state => state.user.isAuthed);
	const [isMeetAvailable, setMeetstatus] = useState(true);
    const navigate = useNavigate();
	const [meetId, setMeetID] = useState("");
	const [failedMessage, setFailedMessage] = useState<string | null>("");

	useEffect(() => {
		if (!isAuthed) {
			navigate("/Auth");
		} 
    }, []);

	function clickConnectToMeet(){
		
		if (meetId == null || meetId == "") {
			setMeetstatus(false);
            return;
		}
		
		CheckMeetByID(meetId).then((res) => {    
            if (res.data.isAlive) {
                navigate("/meet/"+ meetId);    
            }else
            {
                setMeetstatus(false);
            }  
        }).catch((err) => {
            console.log("push на пошту")
        })
	};

	function clickCreateNewMeet(){
		navigate("/newmeet");	
	};

	function clickOpenSettings(){
		navigate("/settings");	
	}
	
	return (
		<div className={styles.Main}>
			<div className={styles.container}>
				<div className={styles.logo}>
					<img alt="Meetik Logo" height="100" src="logo_DDmeetik.png" width="200" />
				</div>
				<h2>
					Головна
				</h2>
				<div className={styles.form_group}>
					<input className={!isMeetAvailable ? styles.input_failed : styles.input} value={meetId} onChange={(event:any) => setMeetID(event.target.value)} placeholder="Код зустрічі" type="text" />
				</div>
				<p className={isMeetAvailable ? styles.loginSuccess : styles.loginError}>
                    Введено некоретний ID зустрічі. Прохання спробувати ще раз.
                </p>

				<button onClick={clickConnectToMeet} className={styles.btn_blue}>
					Приєднатися до зустрічі
				</button>
				<p className={styles.text}>
                    або:
                </p>
				<button onClick={clickCreateNewMeet} className={styles.btn_green}>
					Створити зустріч
				</button>
				<button onClick={clickOpenSettings} className={styles.btn_gray}>
					Налаштування
				</button>
			</div>
		</div>
	)
}

export default Main;