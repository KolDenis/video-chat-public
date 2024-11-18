import { useEffect, useRef, useState } from 'react';
import styles from './VideoStream.module.scss';
import VideoStreamGetter from './VideoStreamGetter';
import { useAppSelector } from '../../store';

const VideoStream = () => {
    const webSocket = useAppSelector(state => state.webSocket.webSocket);
  
    useEffect(() => {  
      navigator.mediaDevices.getUserMedia({ audio: true, video: true}).then((stream) => {
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm; codecs="vp8, opus"',
          videoBitsPerSecond: 1000,
          audioBitsPerSecond: 1000
        });

        mediaRecorder.ondataavailable = (event:any) => {
          if (event.data && event.data.size > 0) {
            webSocket?.send(event.data);
          }
        };

        mediaRecorder.start(100);
      })
      .catch((error) => {
        console.error('Ошибка доступа к устройствам ввода:', error);
      });
    }, []);
  
    return (<></>);
  };
  
  export default VideoStream;