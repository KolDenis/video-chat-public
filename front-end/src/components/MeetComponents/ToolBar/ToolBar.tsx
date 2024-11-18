import { useEffect, useRef, useState } from "react";
import styles from "./ToolBar.module.scss";
import { LocalParticipant, TrackPublication } from "livekit-client";
import SharingChange from "../SharingChange/SharingChange";
import { HubConnection } from "@microsoft/signalr";
import { useAppDispatch, useAppSelector } from "../../../store";
import { MeetUser, setPermission } from "../../../store/meetUsersSlice";

interface Props{
    connection: HubConnection | null
    participant: LocalParticipant
    leave: () => void;
    showChat: () => void;
    permission: {
        video: boolean;
        audio: boolean;
    }
}
const ToolBar = ({connection, participant, leave, showChat, permission}:Props) => {
    const [isMicMuted, setIsMicMuted] = useState<boolean>(!permission.audio);
    const [isVideoDisabled, setIsVideoDisabled] = useState<boolean>(!permission.video);
    const [isSharing, setIsSharing] = useState<boolean>(false);
    const [isPopupShown, setIsPopupShown] = useState(false);
    const screenTrack = useRef<MediaStreamTrack | null>();
    const dispatch = useAppDispatch();
    const meetUsers = useAppSelector(state => state.meetUsers.users);

    useEffect(() => {
        if(!meetUsers) return;

        const AVTrackSids = participant.getTrackPublications()
            .filter(track => track.trackName != "screen")
            .map(track => track.trackSid);

        participant.setTrackSubscriptionPermissions(false, meetUsers.map((user:MeetUser) => {
            return {
                participantIdentity: user.id,
                allowedTrackSids: user.trackSids ? user.trackSids : AVTrackSids
            }
        }));
    }, [meetUsers]);

    const handleMicrophone = () => {
        participant.setMicrophoneEnabled(isMicMuted);
        setIsMicMuted(!isMicMuted);
    }
    
    const handleCamera = () => {
        participant.setCameraEnabled(isVideoDisabled);
        setIsVideoDisabled(!isVideoDisabled);    
    }

    const handleScreen = () => {
        if(isSharing){
            if(screenTrack.current){
                participant.unpublishTrack(screenTrack.current);
            }
            participant.setScreenShareEnabled(isVideoDisabled);
            setIsSharing(!isSharing); 
        }else{
            navigator.mediaDevices.getDisplayMedia({video: true})
                .then((screenStream) => {
                    screenTrack.current = screenStream.getVideoTracks()[0];
        
                    screenTrack.current.onended =() => {
                        if(screenTrack.current)
                        {
                            participant.unpublishTrack(screenTrack.current);
                            setIsSharing(false);
                        }

                        participant.setScreenShareEnabled(isVideoDisabled);
                        setIsSharing(!isSharing); 
                    };

                    setIsPopupShown(true);
                });
        }
    }

    const closeSharingChange = async (allowForUSers:any) => {
        if(screenTrack.current){
            participant.publishTrack(screenTrack.current, {
                name: "screen",
            }).then((sTrack:any) => {
                const allTrackSids = participant.getTrackPublications()
                    .map(track => track.trackSid);

                const AVTrackSids = participant.getTrackPublications()
                    .filter(track => track.trackName != "screen")
                    .map(track => track.trackSid);

                allowForUSers.forEach((user:any) => {
                    console.log(user);
                    if(user.allow){
                        console.log(allTrackSids);
                        dispatch(setPermission({userId: user.id, trackSids: allTrackSids}));
                    }
                    else{
                        dispatch(setPermission({userId: user.id, trackSids: AVTrackSids}));
                    }
                });
            });
            setIsPopupShown(false);
            participant.setScreenShareEnabled(isVideoDisabled);
            setIsSharing(!isSharing); 
        }
    }

    return(
        <div className={styles.Toolbar}>
            <div className={isMicMuted ? styles.sliderPlaceRed : styles.sliderPlaceGreen}>
                <button className={styles.sliderButton+" "+(isMicMuted ? styles.sliderButtonRed : styles.sliderButtonGreen)} onClick={handleMicrophone}>{isMicMuted ? "unmute" : "mute"}</button>
            </div>
            <div className={isVideoDisabled ? styles.sliderPlaceRed : styles.sliderPlaceGreen}>
                <button className={styles.sliderButton+" "+(isVideoDisabled ? styles.sliderButtonRed : styles.sliderButtonGreen)} onClick={handleCamera}>{isVideoDisabled ? "on" : "off"}</button>
            </div>
            <button className={styles.buttonGreen} onClick={handleScreen}>{isSharing ? "close sharing" : "share"}</button>
            {
                isPopupShown &&
                <SharingChange close={closeSharingChange}/>
            }
            <button className={styles.buttonrGrey} onClick={showChat}>Chat</button>
            <button className={styles.buttonRed} onClick={leave}>Leave</button>
        </div>
    )
}

export default ToolBar;