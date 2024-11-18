import { useEffect, useRef, useState } from "react";
import styles from "./WaitingRoom.module.scss";
import toolbarStyles from "../ToolBar/ToolBar.module.scss";

interface Props {
  join: (video: boolean, audio: boolean) => void;
}

const WaitingRoom = ({ join }: Props) => {
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<any>(null);

  const showVideo = async () => {
    if (isVideoDisabled) {
      try {
        streamRef.current = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = streamRef.current;
        }
        setIsVideoDisabled(!isVideoDisabled);
      } catch (err) {
        console.error("Ошибка доступа к камере: ", err);
      }
    }
    else {
      if (videoRef.current)
        videoRef.current.srcObject = null;
      streamRef.current.getTracks().forEach((track: any) => track.stop());
      setIsVideoDisabled(!isVideoDisabled);
    }
  }

  useEffect(() => {
    showVideo()
  }, []);

  return (
    <div className={styles.Waiting}>
      <div className="container">
        <div className="logo">
          <img alt="Meetik Logo" height="100" src="../logo_DDmeetik.png" width="300" />
        </div>
        <h2>
          Підключення до зустрічі
        </h2>
        <div className={styles.videoPlace}>
          <div className={styles.videoPlaceSec}>
            <video className={styles.video} ref={videoRef} autoPlay></video>
          </div>
          <div className={styles.buttons}>
            <div className={isMicMuted ? toolbarStyles.sliderPlaceRed : toolbarStyles.sliderPlaceGreen}>
              <button className={toolbarStyles.sliderButton + " " + (isMicMuted ? toolbarStyles.sliderButtonRed : toolbarStyles.sliderButtonGreen)} onClick={() => setIsMicMuted(!isMicMuted)}>{isMicMuted ? "unmute" : "mute"}</button>
            </div>
            <div className={isVideoDisabled ? toolbarStyles.sliderPlaceRed : toolbarStyles.sliderPlaceGreen}>
              <button className={toolbarStyles.sliderButton + " " + (isVideoDisabled ? toolbarStyles.sliderButtonRed : toolbarStyles.sliderButtonGreen)} onClick={showVideo}>{isVideoDisabled ? "on" : "off"}</button>
            </div>
          </div>
        </div>
        <button className={styles.btn_blue} onClick={() => join(!isVideoDisabled, !isMicMuted)}>
          Приєднатись
        </button>
      </div>
    </div>
  );
}

export default WaitingRoom;