import { useAppSelector } from "../../../store"
import styles from "./Participants.module.scss";

const Participants = () => {
    const users = useAppSelector(state => state.meetUsers.users);
    const user = useAppSelector(state => state.user);

    return (
        <div className={styles.participants}>
            <div className={styles.titlePlace}>
                <h3 className={styles.title}>Participants</h3>
            </div>
            <ul className={styles.listPlace}>
                <li className={styles.listItem} key={user.id}>{user.name} (You)</li>
                {
                    users?.map(item => (
                        <li className={styles.listItem} key={item.id}>{item.name}</li>
                    ))
                }
            </ul>
        </div>
    )
}

export default Participants;