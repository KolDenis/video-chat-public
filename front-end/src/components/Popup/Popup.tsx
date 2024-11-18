import { createPortal } from "react-dom";
import { useAppSelector } from "../../store";
import styles from "./Popup.module.scss";
import { FunctionComponent } from "react";

interface props {
  title: string;
  message: string;
  onClose: () => void;
  onAnswer: (answer: string) => void;
}

const Popup: FunctionComponent<props> = ({ title, message, onClose, onAnswer }: props) => {
  
  const handleYesClick = () => {
    onAnswer('Yes');
  };

  const handleNoClick = () => {
    onAnswer('No');
  };
  
  return (
    <div className={styles.popupo_overlay} onClick={onClose}>
      <div className={styles.popup}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.text}>{message}</p>
        <div className={styles.button_visible}>
          <button className={styles.button_close} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default Popup;