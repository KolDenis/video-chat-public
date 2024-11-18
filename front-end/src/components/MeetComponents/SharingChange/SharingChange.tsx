import styles from "./SharingChange.module.scss";
import stylesPopup from "../../Popup/Popup.module.scss";
import { useAppSelector } from "../../../store";
import { useEffect, useState } from "react";

interface Props{
    close: (allowForUSers:any) => void;
}

const SharingChange = ({close}:Props) => {
    const users = useAppSelector(state => state.meetUsers.users);
    const userId = useAppSelector(state => state.user.id);
    const [forUsers, setForUsers] = useState<any>(users?.map((item:any) => {
        return {id: item.id, allow:false}
    }).filter((user:any) => user.id != userId));

    const allowFor = (id:string, allow:boolean) => {
        console.log(forUsers);
        if(forUsers.find((item:any) => item.id == id)){
            setForUsers([...forUsers.filter((item:any) => item.id != id), {id, allow}]);
        }
        else{
            setForUsers([...forUsers, {id, allow}]);
        }
    }

    return (
        <div className={stylesPopup.popupo_overlay}>
          <div className={stylesPopup.popup}>
            <h1 className={styles.title}>Поділитися з</h1>
            {
                forUsers 
                &&
                <div className={styles.body}>
                {
                    users?.filter(user => user.id != userId)?.map(user => (
                        <div className={styles.User} key={user.id}>
                            <p>{user.name}</p>
                            <input type="checkbox" onChange={(event:any) => allowFor(user.id, event.target.checked)} />
                        </div>
                    ))
                }
            </div>
            }
            <button className={styles.button} onClick={() => close(forUsers)}>Поділитися</button>
          </div>
        </div>
      );
}

export default SharingChange;