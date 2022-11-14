import {
  Box,
  Button,
  IconButton,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import React, { useCallback, useEffect } from 'react';
import { useInteractable } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';

// i need to figure out how the back and front end communicate :C

// import Value, { getValueNumbers } from '../../../../../townService/src/games/cards/Value';
// import Suit from '../../../../../townService/src/games/cards/Suit';

// export function Card({ value, suit }: { value: Value; suit: Suit }) {
//   let cardValueId: number;
//   switch (value) {
//     case Value.Ace:
//       cardValueId = 13;
//       break;
//     case Value.King:
//       cardValueId = 12;
//       break;
//     case Value.Queen:
//       cardValueId = 11;
//       break;
//     case Value.Jack:
//       cardValueId = 10;
//       break;
//     default:
//       cardValueId = getValueNumbers(value)[0] - 1;
//       break;
//   }
//   let cardId: number;
//   switch (suit) {
//     case Suit.Spades:
//       cardId = cardValueId;
//       break;
//     case Suit.Clubs:
//       cardId = cardValueId + 13;
//       break;
//     case Suit.Diamonds:
//       cardId = cardValueId + 26;
//       break;
//     case Suit.Hearts:
//       cardId = cardValueId + 39;
//       break;
//   }
//   const cardIdString = ('0' + cardId).slice(-2);
//   const card = `assets/blackjack/playingcards/playingcards_${cardIdString}.png`;
//   return <Image src={card} />;
// }

export function Card({ cardId, x, y }: { cardId: number; x: number; y: number }) {
  const cardIdString = ('0' + cardId).slice(-2);
  const card = `assets/blackjack/playingcards/playingcards_${cardIdString}.png`;
  return <Image width='64px' position='absolute' src={card} top={y + 'px'} left={x + 'px'} />;
}

export function Chip({ chipValue, x, y }: { chipValue: number; x: number; y: number }) {
  // const ref = useRef();
  // const [isModalOpen, setIsModalOpen] = useState(false);
  // useOutsideClick({
  //   handler: () => setIsModalOpen(false),
  // });

  const chip = `assets/blackjack/chips/chip_${chipValue}.png`;
  return (
    <IconButton
      variant='ghost'
      colorScheme='ghost'
      top={y + 'px'}
      left={x + 'px'}
      icon={<Image width='40px' position='absolute' src={chip} />}
      aria-label={''}
    />
  );
  // <Image width='40px' position='absolute' src={chip} top={y + 'px'} left={x + 'px'} />
  // );
}

export function Blackjack() {
  return (
    <Box
      backgroundImage='assets/blackjack/blackjack_background.jpg'
      width='960px'
      height='600px'
      backgroundRepeat='no-repeat'
      backgroundSize='cover'
      position='relative'>
      <Card cardId={33} x={450} y={400} />
      <Card cardId={22} x={470} y={425} />
      <Chip chipValue={1} x={610} y={480} />
      <Chip chipValue={5} x={640} y={480} />
      <Chip chipValue={25} x={670} y={480} />
      <Chip chipValue={100} x={700} y={480} />
      <Chip chipValue={500} x={730} y={480} />
    </Box>
  );
}

export default function BlackjackModal(): JSX.Element {
  const coveyTownController = useTownController();
  const newBlackjack = useInteractable('gamingArea');

  const isOpen = newBlackjack !== undefined;

  useEffect(() => {
    if (newBlackjack) {
      coveyTownController.pause();
    } else {
      coveyTownController.unPause();
    }
  }, [coveyTownController, newBlackjack]);

  const closeModal = useCallback(() => {
    if (newBlackjack) {
      coveyTownController.interactEnd(newBlackjack);
    }
  }, [coveyTownController, newBlackjack]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        closeModal();
        coveyTownController.unPause();
      }}
      size='5xl'>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Blackjack!</ModalHeader>
        <ModalBody>
          <Blackjack />
        </ModalBody>
        <ModalCloseButton />
        <ModalFooter>
          <Button colorScheme='blue' mr={3} onClick={closeModal}>
            Done
          </Button>
          <Button onClick={closeModal}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
