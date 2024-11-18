import { useEffect, useState } from "react";
import styles from "./Settings.module.scss";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../store";
import { changeUserCredentialsByID, getUserCredentialsByID } from "../../api";
import { usePopup } from "../../PopupProvider";
import Popup from "../../components/Popup/Popup";

const Settings = () => {
    const navigate = useNavigate()
    const userID = useAppSelector(state => state.user.id);
    const [isGoogleAuth, setGoogleAuth] = useState(true);
    const [isCredentialsChanged, setChangedCredentials] = useState(false);
    const { showPopup } = usePopup();
    const [localUserName, setLocalName] = useState("");
    const [localUserEmail, setLocalEmail] = useState("");
    const [localUserPassword, setLocalPassword] = useState("");

    useEffect(() => {
        getUserCredentialsByID().then((res) => {
            if (res.data.user == null)
                return;

            console.log(res.data.user.typeOfAuth == "GoogleAuth");
            setGoogleAuth(res.data.user.typeOfAuth == "GoogleAuth" ? true : false);
            setLocalName(res.data.user.name);
            setLocalEmail(res.data.user.email);
            setLocalPassword(res.data.user.password);

        }).catch((err) => {
            console.log(err)
        })
    }, []);

    function saveCredentialsByUserID() {

        if (isCredentialsChanged) {
            changeUserCredentialsByID(localUserName, localUserEmail, localUserPassword).then((res) => {
                let PopUpTitle = "Налаштування: персональні дані.";
                let PopUpText = "";
                if (res.data.success) {
                    PopUpText = "Персональні дані змінено успішно";
                } else {
                    PopUpText = "Виникла помилка при зміні персональних даних.";
                }

                showPopup(PopUpTitle, PopUpText, ()=>{
                    navigate("/");
                });

            }).catch((err) => {
                console.log("push на пошту")
            })
        }
        else {
            showPopup("Дані не змінено", "Дані не змінено.");
            navigate("/");
        }

    };

    const discardChangesAndBack = async () => {
        navigate("/")
    };

    const handleInputNameChange = (event: any) => {
        const newValue = event.target.value;

        setLocalName(newValue);
        setChangedCredentials(true);
    };

    const handleInputEmailChange = (event: any) => {
        const newValue = event.target.value;

        setLocalEmail(newValue);
        setChangedCredentials(true);
    };

    const handleInputPasswordChange = (event: any) => {
        const newValue = event.target.value;

        setLocalPassword(newValue);
        setChangedCredentials(true);
    };

    return (
        <div>
            <div className={styles.container}>
                <div className={styles.logo}>
                    <img alt="Meetik Logo" height="100" src="logo_DDmeetik.png" width="200" />
                </div>
                <h2>
                    Налаштування
                </h2>
                <div className={styles.form_group}>
                    <input className={styles.input} onChange={handleInputNameChange} value={localUserName} placeholder="Ім'я та Прізвище" type="text" />
                </div>
                <div className={styles.form_group}>
                    <input className={styles.input} onChange={handleInputEmailChange} value={localUserEmail} placeholder="Email" type="text" />
                </div>
                <div className={styles.form_group}>
                    <input className={isGoogleAuth ? styles.hidden_input : styles.input} onChange={handleInputPasswordChange} placeholder="Password" type="email" />
                </div>
                <button onClick={saveCredentialsByUserID} className={styles.btn_green}>
                    Зберегти
                </button>
                <button onClick={discardChangesAndBack} className={styles.btn_red}>
                    Повернутись
                </button>
            </div>
        </div>
    )
}

export default Settings;