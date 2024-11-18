import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import styles from "./Chat.module.scss"
import { Message, newMessage } from "../../../store/chatSlice";
import { HubConnection } from "@microsoft/signalr";

interface Props{
    connection: HubConnection;
    isChatShown: boolean;
}

const Chat = ({connection, isChatShown}:Props) => {
    const messages = useAppSelector(state => state.chat.messages);
    const dispatch = useAppDispatch();
    const [text, setText] = useState<string>("");

    function sendMessage(event:any){
        connection.send("SendMessage", text);
        setText("");
    }

    useEffect(() => {
        connection.on("Message", (mes) => {
            dispatch(newMessage(mes));
        })
    }, []);

    return (
        <div className={isChatShown ? styles.Chat : styles.hiddenChat}>
            <div className={styles.titlePlace}>
                <h3 className={styles.title}>Chat</h3>
            </div>
            <div className={styles.chatPlace}>
                <div className={styles.chatScrolledPlace}>
                    {
                        messages.map((mes:Message, index:number) => (
                            <div className={styles.ChatMessage} key={index}>
                                <div className={styles.ChatMessageSender}>{mes.sender}</div>
                                <div className={styles.ChatMessageText}>{mes.text}</div>
                            </div>
                        ))
                    }
                </div>
            </div>
            <div className={styles.inputPlace}>
                <input className={styles.input} placeholder="type message" type="text" value={text} onChange={(e:any) => setText(e.target.value)}/>
                <button className={styles.button} onClick={sendMessage}>send</button>
            </div>
        </div>
    )
}

export default Chat;