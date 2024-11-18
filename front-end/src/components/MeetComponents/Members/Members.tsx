import { LocalVideoTrack, RemoteTrackPublication } from "livekit-client";
import { useAppSelector } from "../../../store";
import styles from "./Members.module.scss";
import { TrackInfo } from "../Meet/Meet";
import MemberVideo from "../Member/MemberVideo";
import MemberAudio from "../Member/MemberAudio";
import { MeetUser } from "../../../store/meetUsersSlice";
import { useState } from "react";

interface Props{
    remoteTracks: TrackInfo[];
    localTrack: LocalVideoTrack | undefined;
    isChatShown: boolean;
}

const Members = ({remoteTracks, localTrack, isChatShown}:Props) => {
    const user = useAppSelector(state => state.user);
    const users = useAppSelector(state => state.meetUsers.users);
    const [pinned, setPinned] = useState<string>("");

    const getUserName = (id:string) =>{
        if(!users) return "undefined";
        const userName = users.find((user1:MeetUser) => user1.id == id)?.name;
        return userName ? userName : "undefined";
    }

    const pin = (sid: string | undefined) => {
        if(!sid) return;
        if(sid == pinned){
            setPinned("");
        }
        else{
            setPinned(sid);
        }
    }

    const getMembers = () => {
        const elements = [];
        if(localTrack){
            elements.push(<MemberVideo 
                pinned={pinned == "" ? null : pinned === localTrack.sid ? true : false} 
                pin={pin} 
                track={localTrack}  
                member={user.name} 
                local={true} 
                key={localTrack.sid}/>);
        }
        remoteTracks.forEach((remoteTrack) =>
            {
                if(remoteTrack.trackPublication.kind === "video"){
                    elements.push(<MemberVideo
                        pinned={pinned == "" ? null : pinned === remoteTrack.trackPublication.trackSid ? true : false} 
                        pin={pin}
                        key={remoteTrack.trackPublication.trackSid}
                        track={remoteTrack.trackPublication.videoTrack!}
                        member={getUserName(remoteTrack.participantIdentity)}
                    />)
                }
                else{
                    elements.push(<MemberAudio
                        key={remoteTrack.trackPublication.trackSid}
                        track={remoteTrack.trackPublication.audioTrack!}
                        member={remoteTrack.participantIdentity}
                    />);
                }
            }
        )

        return elements;
    }

    return(
        <>
            {
                pinned === ""
                ?
                <div className={isChatShown ? styles.Members : styles.MembersWide}>
                    {getMembers()}
                </div>
                :
                <div className={isChatShown ? styles.MembersWithPinned : styles.MembersWithPinnedWide}>
                    <div className={styles.MembersList}>
                        <div className={styles.MemberListPlate}>
                            {getMembers().filter(node => node.key !== pinned)}
                        </div>
                    </div>
                    <div className={styles.mainMember}>
                        {getMembers().find(node => node.key === pinned)}
                    </div>
                </div>
            }
        </>
    )
}

export default Members;