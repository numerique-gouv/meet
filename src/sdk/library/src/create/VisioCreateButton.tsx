import { DEFAULT_CONFIG } from "@/Config";
import { ClientMessageType } from "@/Types";
import { useEffect, useRef } from "react";

export const VisioCreateButton = ({
  onRoomCreated,
}: {
  onRoomCreated: (roomUrl: string) => void;
}) => {
  useEffect(() => {
    window.onmessage = (event) => {
      // TODO: Verify origin.
      // console.log('Message received window', event.data, event.origin);
      // if (event.origin !== ORIGIN) {
      //     console.error('Origin not allowed', event.origin);
      //     return;
      // }
      if (event.data.type === ClientMessageType.ROOM_CREATED) {
        const data = event.data.data;
        const roomUrl = data.url;
        onRoomCreated(roomUrl);
      }
    };
  }, []);

  return (
    <iframe
      allow="clipboard-read; clipboard-write"
      src={DEFAULT_CONFIG.url + "/create-button"}
      style={{
        width: "100%",
        height: "52px",
        border: "none",
      }}
    ></iframe>
  );
};
