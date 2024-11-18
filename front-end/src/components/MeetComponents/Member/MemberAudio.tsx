import { useEffect, useRef } from "react";
import styles from "./Member.module.scss";
import { LocalAudioTrack, RemoteAudioTrack } from "livekit-client";

interface Props {
    track: LocalAudioTrack | RemoteAudioTrack;
    local?: boolean;
    member: string;
}

const MemberAudio = ({track, member, local = false}:Props) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (audioRef.current) {
            track.attach(audioRef.current);
        }       

        return () => {
            track.detach();
        };
    }, [track]);

    return(
        <audio className={styles.memberAudio} ref={audioRef} autoPlay></audio>
    )
}

export default MemberAudio;