import { PropsWithChildren } from 'react';
import ReactModal from 'react-modal';

interface ModalProps extends PropsWithChildren {
  opened: boolean;
  onClose: () => void;
}

export const Modal = ({ children, opened, onClose }: ModalProps) => {
  if (!opened) {
    return null;
  }

  return (
    <ReactModal
      ariaHideApp={false}
      isOpen={opened}
      onRequestClose={() => onClose()}
      style={{
        overlay: {
          backgroundColor: '#0c1a2b99',
        },
        content: {
          left: '50%',
          transform: 'translate(-50%, 0)',
          width: '1200px',
          padding: '0',
        },
      }}
    >
      {children}
    </ReactModal>
  );
};
