import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { Modal } from '@/Modal';
import { ClientMessageType, ConfigType, File } from '@/Types';

export interface FileExplorerProps {
  onSelection: (files: File[]) => void;
  maxFiles?: number;
  config: ConfigType;
}

const Iframe = styled.iframe`
  border: none;
  width: 100%;
  height: 100%;
  overflow: auto;
`;

export const FileExplorer = ({
  onSelection,
  config,
  maxFiles,
}: FileExplorerProps) => {
  const iframe = useRef<HTMLIFrameElement>(null);
  const [modalOpened, setModalOpened] = useState(true);

  /**
   * SDK
   */

  /**
   * TODO: maybe make a specific client.
   */
  useEffect(() => {
    window.onmessage = (event) => {
      // TODO: Verify origin.
      // console.log('Message received window', event.data, event.origin);
      // if (event.origin !== ORIGIN) {
      //     console.error('Origin not allowed', event.origin);
      //     return;
      // }
      if (event.data.type === ClientMessageType.SELECTION) {
        const data = event.data.data;
        const files = data.files as File[];
        onSelection(files);
        setModalOpened(false);
      }
      if (event.data.type === ClientMessageType.CANCEL) {
        setModalOpened(false);
      }
    };
  }, []);

  const getUrl = () => {
    const url = new URL(config.explorerUrl);
    const params = {
      maxFiles,
    };
    url.searchParams.set('params', JSON.stringify(params));
    return url.toString();
  };

  return (
    <Modal opened={modalOpened} onClose={() => setModalOpened(false)}>
      <Iframe
        ref={iframe}
        title="Exploreur de fichiers Resana"
        src={getUrl()}
      />
    </Modal>
  );
};
