import {
  Button,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import useTownController from '../../hooks/useTownController';

export default function LeaderboardModal(): JSX.Element {
  const coveyTownController = useTownController();
  // State for keeping track of whether key is pressed
  const [showModal, setShowModal] = useState<boolean>(false);
  // If pressed key is our target key then set to true
  function downHandler({ key }: { key: any }) {
    if (key === 'Shift') {
      setShowModal(!showModal);
      if (coveyTownController.paused) {
        coveyTownController.unPause();
      } else {
        coveyTownController.pause();
      }
    }
  }
  // If released key is our target key then set to false
  const closeModal = () => {
    setShowModal(false);
    coveyTownController.unPause();
  };

  useEffect(() => {
    window.addEventListener('keydown', downHandler);
    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener('keydown', downHandler);
    };
  });

  return (
    <Modal
      isOpen={showModal}
      onClose={() => {
        closeModal();
      }}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>LEADERBOARD PLACEHOLDER</ModalHeader>
        <ModalCloseButton />
        <ModalFooter>
          <Button colorScheme='blue' mr={3} onClick={closeModal}>
            Done
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
