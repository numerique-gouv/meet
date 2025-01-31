import { DEFAULT_CONFIG } from "@/Config";
import { ClientMessageType } from "@/Types";
import { useEffect, useRef } from "react";

export const VisioCreateButton = () => {
  const iframe = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    window.onmessage = (event) => {
      // TODO: Verify origin.
      // console.log('Message received window', event.data, event.origin);
      // if (event.origin !== ORIGIN) {
      //     console.error('Origin not allowed', event.origin);
      //     return;
      // }
      if (event.data.type === ClientMessageType.ROOM_CREATED) {
        console.log("event", event);
        const data = event.data.data;
      }
    };
  }, []);

  return (
    <iframe
      src={DEFAULT_CONFIG.url + "/create-button"}
      style={{
        width: "100%",
        height: "48px",
        border: "none",
      }}
    ></iframe>
  );
};
