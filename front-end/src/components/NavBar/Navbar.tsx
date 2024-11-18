import { useEffect } from "react";
import { GetUrl } from "../../api";
import { useAppSelector } from "../../store";
import styles from "./NavBar.module.scss";
import { login } from "../../store/userSlice";

export default function NavBar(){
    const isAuthed = useAppSelector(state => state.user.isAuthed);
	function Login(){
        GetUrl().then((res) => {
            window.location.href = res.data.url;
        }).catch((err) => {
            console.log("error")
        })
    }

	return(
		<div className={styles.Navbar}>
            {
                !isAuthed 
                ? 
                <button onClick={Login}>sign in</button>
                : 
                <>NavBar</>
            }
		</div>
	);
}