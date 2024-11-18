import { LocalAudioTrack, LocalVideoTrack, RemoteAudioTrack, RemoteVideoTrack } from "livekit-client";
import styles from "./Member.module.scss";
import { memo, useEffect, useRef } from "react";

interface Props {
    track: RemoteVideoTrack | LocalVideoTrack;
    local?: boolean;
    member: string;
    pin: (sid: string | undefined) => void
    pinned: boolean | null;
}

const MemberVideo = memo(({pinned, pin, track, member, local = false}:Props) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        if (videoRef.current) {
            track.attach(videoRef.current);
        }

        return () => {
            track.detach();
        };
    }, [track]);

    return(
        <div className={pinned === null ? styles.Member : pinned === true ? styles.PinnedMember : styles.ListMember}>
            <button className={styles.pinButton} onClick={() => pin(track.sid)}>{pinned ? "unpin" : "pin"}</button>
            <div className={styles.videoPlace}>
                <video className={pinned ? styles.memberVideoFull : styles.memberVideo} ref={videoRef} id={track.sid} />
            </div>
            <p className={styles.name}>{member + (local ? " (You)" : "")}</p>
        </div>
    )
})

export default MemberVideo;