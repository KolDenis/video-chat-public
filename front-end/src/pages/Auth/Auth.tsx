import styles from "./Auth.module.scss";
import { GetUrl, loginByCredentials, registerByCredentials } from "../../api";
import { useAppDispatch, useAppSelector } from "../../store";
import { createHook } from "async_hooks";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { usePopup } from "../../PopupProvider";
import { login } from "../../store/userSlice";

const Auth = () => {
    const navigate = useNavigate()
    const [isRegistration, setIsRegistration] = useState<boolean>(false);
    const [userLogin, setLogin] = useState("");
    const [userPassword, setPassword] = useState("");
    const [userPassword2, setPassword2] = useState("");
    const [userName, setName] = useState("");
    const [failedMessage, setFailedMessage] = useState<string | null>("");
    const { showPopup } = usePopup();
    const dispatch = useAppDispatch();

    document.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
        
            event.preventDefault();
            tryLogin();
        }
    });

    function googleAuth() {
        GetUrl().then((res) => {
            window.location.href = res.data.url;
        }).catch((err) => {
            console.log("error")
        })
    }

    function changeEmail(event: any) {
        setLogin(event.target.value);
        setFailedMessage(null);
    }

    function changePassword(event: any) {
        setPassword(event.target.value);
        setFailedMessage(null);
    }

    function changePassword2(event: any) {
        setPassword2(event.target.value);
        setFailedMessage(null);
    }
    
    function changeUserName(event: any) {
        setName(event.target.value);
        setFailedMessage(null);
    }

    function tryLogin() {
        if (userPassword == "" || userLogin == "") {
            setFailedMessage("Заповніть всі поля");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(userLogin)) {
            setFailedMessage("Невірний email.");
            return;
        }

        loginByCredentials(userLogin, userPassword).then((res) => {
            if (res.data.authed) {
                dispatch(login(res.data.user));
                navigate("/");
            } else {
                setFailedMessage("Введено невірний логін та/або пароль. Прохання спробувати ще раз.");
            }
        }).catch((err) => {
            showPopup("Error", err.message);
        })
    }

    function registration() {
        if (!isRegistration) {
            setIsRegistration(true);
            setFailedMessage(null);
            return;
        }

        if (userPassword == "" || userPassword2 == "" || userLogin == "" || userName == "") {
            setFailedMessage("Заповніть всі поля");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(userLogin)) {
            setFailedMessage("Невірний email.");
            return;
        }

        if (userPassword != userPassword2) {
            setFailedMessage("Паролі повинні бути однакові.");
            return;
        }

        registerByCredentials(userName, userLogin, userPassword).then((res: any) => {
            if (!res.data.registered) {
                setFailedMessage(res.data.message);
                return;
            }

            dispatch(login(res.data.user));
            navigate("/");
        }).catch((err: any) => {
            showPopup("Error", err.message);
        });
    }

    return (
        <div>
            <div className={styles.container}>
                <div className={styles.logo}>
                    <img alt="Meetik Logo" height="100" src="logo_DDmeetik.png" width="400" />
                </div>
                <h2>
                    Авторизація
                </h2>

                {
                    isRegistration &&
                    <div className={styles.form_group}>
                        <input className={!failedMessage ? styles.input : styles.input_failed} value={userName} onChange={changeUserName} placeholder="Ім'я" type="text" />
                    </div>
                }
                <div className={styles.form_group}>
                    <input className={!failedMessage ? styles.input : styles.input_failed} value={userLogin} onChange={changeEmail} placeholder="Email" type="email" />
                </div>
                <div className={styles.form_group}>
                    <input className={!failedMessage ? styles.input : styles.input_failed} value={userPassword} onChange={changePassword} placeholder="Пароль" type="password" />
                </div>
                {
                    isRegistration &&
                        <div className={styles.form_group}>
                            <input className={!failedMessage ? styles.input : styles.input_failed} value={userPassword2} onChange={changePassword2} placeholder="Підтвердження паролю" type="password" />
                        </div>
                }
                <p className={failedMessage ? styles.loginError : styles.loginSuccess}>
                    {failedMessage}
                </p>
                {
                    !isRegistration &&
                    <button onClick={tryLogin} className={styles.btn_blue}>
                        Увійти
                    </button>
                }
                <button onClick={registration} className={styles.btn_green}>
                    Зареєструватися
                </button>
                <p>
                    Увійти за допомогою
                </p>
                <button onClick={googleAuth} className={styles.btn_google}>
                    <img alt="Google Logo" height="20"
                        src="google.png"
                        width="20" />
                    Google
                </button>
            </div>
        </div>
    )
}


export default Auth;