import React from 'react';
import styled from 'styled-components';

const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.6);
    display: grid;
    place-items: center;
    z-index: 9999;
  `;

const ModalContent = styled.div`
    background: #fff;
    padding: 0rem;
    border-radius: 1px;
    width: 90%;
    height: 85%;
    max-width: 1200px;
    max-height: 90vh;
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
  `;

const CloseButton = styled.button`
    position: absolute;
    top: 0.3px;
    right: 0.9px;
    background: red;
    border: none;
    color: white;
    font-weight: bolder;
    padding: 0.4rem 0.4rem;
    border-radius: 2px;
    font-size: 1.5rem;
    cursor: pointer;
    z-index: 100;
  `;

const ContentArea = styled.div`
    flex-grow: 1;
    overflow: hidden;

    iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
  `;

const Modal = ({ children, onClose }) => {
  return (
    <Overlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>X</CloseButton>
        <ContentArea>{children}</ContentArea>
      </ModalContent>
    </Overlay>
  );
};

export default Modal;
