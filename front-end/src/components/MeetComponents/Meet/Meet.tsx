import { LocalVideoTrack, Participant, RemoteParticipant, RemoteTrack, RemoteTrackPublication, Room, RoomEvent } from "livekit-client";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store";
import { getToken, host } from "../../../api";
import styles from "./Meet.module.scss";
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { usePopup } from "../../../PopupProvider";
import { MeetUser, MeetUsers, newUser, removeUser, set, setDefaultPermissions, setPermission } from "../../../store/meetUsersSlice";
import Participants from "../Participants/Participants";
import Chat from "../Chat/Chat";
import ToolBar from "../ToolBar/ToolBar";
import Members from "../Members/Members";

const livekit = "ws://localhost:7880/";

export type TrackInfo = {
    trackPublication: RemoteTrackPublication;
    participantIdentity: string;
};

interface Props{
    permission: {
        video: boolean;
        audio: boolean;
    }
}

const Meet = ({permission}:Props) => {
    const { id } = useParams();
    const [room, setRoom] = useState<Room | undefined>(undefined);
    const [localTrack, setLocalTrack] = useState<LocalVideoTrack | undefined>(undefined);
    const [remoteTracks, setRemoteTracks] = useState<TrackInfo[]>([]);
    const navigate = useNavigate();
    const connection = useRef<HubConnection | null>(null);
    const [signalRConnected, seSignalRConnected] = useState<boolean>(false);
    const {showPopup} = usePopup();
    const dispatch = useAppDispatch();
    const [roomConnected, setRoomConnected] = useState<boolean>(false);
    const [isChatShown, setIsChatShown] = useState(false);
    const meetUsers = useAppSelector(state => state.meetUsers.users);

    useEffect(() => {
        connection.current = new HubConnectionBuilder()
            .withUrl(host +  'signal?roomId=' + id)
            .withAutomaticReconnect()
            .build();
        
        connection.current.start()
        .then(() => {
            console.log('SignalR onnection established!');
            seSignalRConnected(true);
        })
        .catch(err => {
            console.error('SignalR connection failed: ', err);
            seSignalRConnected(false);
            leaveRoom();
        });
        connection.current.onclose(err => {
            navigate("/");
        });
        connection.current.on("Users", (res) => {
            dispatch(set(res));
        })
        connection.current.on("ServerMessage", (res) => {
            showPopup("ServerMessage", res);
        })
        connection.current.on("AllowWatchSharing", () => {
            
        })
    }, []);

    useEffect(() => {
        if(!id) return;
        if(!signalRConnected) return;

        const room = new Room();

        room.on(
            RoomEvent.TrackSubscribed,
            (_track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
                setRemoteTracks((prev) => [
                    ...prev,
                    { trackPublication: publication, participantIdentity: participant.identity }
                ]);
            }
        );

        room.on(RoomEvent.TrackUnsubscribed, (_track: RemoteTrack, publication: RemoteTrackPublication) => {
            setRemoteTracks((prev) => prev.filter((track) => track.trackPublication.trackSid !== publication.trackSid));
        });

        room.on('participantConnected', participant => {
            const AVTrackSids = room.localParticipant.getTrackPublications()
                    .filter(track => track.trackName != "screen")
                    .map(track => track.trackSid);
            dispatch(setPermission({
                userId: participant.identity,
                trackSids: AVTrackSids
            }));
          });
        
        setRoom(room);

        connection.current?.on("NewUser", (res) => {
            if(!room) return;
            const AVTrackSids = room.localParticipant.getTrackPublications()
                    .filter(track => track.trackName != "screen")
                    .map(track => track.trackSid);

            dispatch(newUser({
                ...res,
                trackSids: AVTrackSids
            }));
        })
        connection.current?.on("RemoveUser", (id) => {
            dispatch(removeUser(id));
        })

        getToken()
            .then(res => {
                return room.connect(livekit, res.data.token);
            })
            .then(() => {
                setRoomConnected(true);
                return room.localParticipant.enableCameraAndMicrophone();
            })
            .then(() => {
                if(!permission.video)
                    room.localParticipant.setCameraEnabled(false);
                if(!permission.audio)
                    room.localParticipant.setMicrophoneEnabled(false);
                setLocalTrack(room.localParticipant.videoTrackPublications.values().next().value?.videoTrack);

                if(!meetUsers) return;

                const AVTrackSids = room.localParticipant.getTrackPublications()
                    .filter(track => track.trackName != "screen")
                    .map(track => track.trackSid);

                dispatch(setDefaultPermissions(AVTrackSids));
            })
            .catch(error => {
                leaveRoom();
            });
    }, [signalRConnected]);

    async function leaveRoom() {
        room?.disconnect()
            .then(() => {
                setRoom(undefined);
                setLocalTrack(undefined);
                setRemoteTracks([]);
                connection.current?.stop();
                navigate("/");
            });
    }

    return(
        <div className={styles.Meet}>
            {
                room && roomConnected && <>
                    <Participants/>
                    <Members remoteTracks={remoteTracks} localTrack={localTrack} isChatShown={isChatShown}/>
                    {connection.current && <Chat connection={connection.current} isChatShown={isChatShown}/>}
                    <ToolBar connection={connection.current} participant={room.localParticipant} leave={leaveRoom} permission={permission} showChat={() => setIsChatShown(!isChatShown)}/>
                </>
            }
        </div>
    )
}

export default Meet;