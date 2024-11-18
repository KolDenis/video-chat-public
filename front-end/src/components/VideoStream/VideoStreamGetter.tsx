import React, { useEffect, useRef } from 'react';
import { useAppSelector } from '../../store';

const VideoStreamGetter: any = () => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const mediaSourceRef = useRef<MediaSource>(new MediaSource());
    const webSocket = useAppSelector(state => state.webSocket.webSocket);

    useEffect(() => {
        const queue:any = [];

        if(videoRef.current)
            videoRef.current.src = URL.createObjectURL(mediaSourceRef.current);

        mediaSourceRef.current.addEventListener('sourceopen', () => {
            var sourceBuffer = mediaSourceRef.current.addSourceBuffer('video/webm; codecs="vp8, opus"');
          
            const processQueue = () => {
              if (queue.length > 0 && !sourceBuffer.updating) {
                  sourceBuffer.appendBuffer(queue.shift());
              }
            };
            if(webSocket){
                webSocket.addEventListener("message", (event:any) => {
                    const data = JSON.parse(event.data);
                    if(data.type != "stream"){
                        return;
                    }
                    const arrayU8 = new Uint8Array(data.stream);
                    queue.push(arrayU8);
                    processQueue();
                })
            }
            
            sourceBuffer.addEventListener('updateend', () => {
                processQueue();

                if (videoRef.current?.paused) {
                    videoRef.current.play();
                }
            });
            
            sourceBuffer.addEventListener('error', (event) => {
                console.error('SourceBuffer error:', event);
            });
        });
    }, [webSocket]);

    return (
        <div>
            <video ref={videoRef} />
        </div>
    );
};

export default VideoStreamGetter;
