import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Image,
  Box,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useInteractable, useGamingAreaController } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import GamingAreaController from '../../../classes/GamingAreaController';
import GamingArea from './GamingArea';
import { Card } from '../../../types/CoveyTownSocket';

// i need to figure out how the back and front end communicate :C

// import Value, { getValueNumbers } from '../../../../../townService/src/games/cards/Value';
// import Suit from '../../../../../townService/src/games/cards/Suit';

function cardToId(card: Card): number {
  const value = card.value;
  const suit = card.suit;
  const valueMap = new Map<string, number>([
    ['Ace', 13],
    ['King', 12],
    ['Queen', 11],
    ['Jack', 10],
    ['Ten', 9],
    ['Nine', 8],
    ['Eight', 7],
    ['Seven', 6],
    ['Six', 5],
    ['Five', 4],
    ['Four', 3],
    ['Three', 2],
    ['Two', 1],
  ]);

  const cardValueId = valueMap.get(value);
  let cardId: number;
  if (cardValueId) {
    switch (suit) {
      case 'Spades':
        cardId = cardValueId;
        break;
      case 'Clubs':
        cardId = cardValueId + 13;
        break;
      case 'Diamonds':
        cardId = cardValueId + 26;
        break;
      case 'Hearts':
        cardId = cardValueId + 39;
        break;
      default:
        cardId = -1;
        break;
    }
    return cardId;
  }
  throw new Error('Value not found in table');
}

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

export function PlayingCard({ cardId, x, y }: { cardId: number; x: number; y: number }) {
  const cardIdString = ('0' + cardId).slice(-2);
  const card = `assets/blackjack/playingcards/playingcards_${cardIdString}.png`;
  return <Image width='64px' position='absolute' src={card} top={y + 'px'} left={x + 'px'} />;
}

export function Blackjack({ controller }: { controller: GamingAreaController }) {
  const townController = useTownController();
  const [dealerHand, setDealerHand] = useState<Card[]>(controller.dealerHand);
  useEffect(() => {
    console.log(controller.id);
  });

  useEffect(() => {
    const setNewDealerHand = (hand: Card[]) => {
      setDealerHand(hand);
    };
    controller.addListener('dealerHandChange', setNewDealerHand);
    return () => {
      controller.removeListener('dealerHandChange', setNewDealerHand);
    };
  }, [controller, townController]);

  const hit = () => {
    controller.advanceTurn(townController.userID, true);
  };
  return (
    <Box
      backgroundImage='assets/blackjack/blackjack_background.jpg'
      width='960px'
      height='600px'
      backgroundRepeat='no-repeat'
      backgroundSize='cover'
      position='relative'>
      <PlayingCard cardId={33} x={450} y={400} />
      <PlayingCard cardId={cardToId({ value: 'Ace', suit: 'Hearts' })} x={475} y={425} />
      <Button top='30px' left='30px' position='absolute'>
        Hit
      </Button>
      {/*<Image src='assets/blackjack/blackjack_background.jpg' boxSize='100%' objectFit='cover' />*/}
    </Box>
  );
}

export function BlackjackModal({ gamingArea }: { gamingArea: GamingArea }): JSX.Element {
  const coveyTownController = useTownController();
  const gamingAreaController = useGamingAreaController(gamingArea.name);

  const [isOpen, setIsOpen] = useState<boolean>(gamingArea !== undefined);

  useEffect(() => {
    if (isOpen) {
      coveyTownController.pause();
    } else {
      coveyTownController.unPause();
    }
  }, [coveyTownController, isOpen]);

  const closeModal = useCallback(() => {
    coveyTownController.unPause();
    setIsOpen(false);
  }, [coveyTownController, setIsOpen]);

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
          <Blackjack controller={gamingAreaController} />
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

export default function BlackjackWrapper(): JSX.Element {
  const gamingArea = useInteractable<GamingArea>('gamingArea');
  if (gamingArea) {
    return <BlackjackModal gamingArea={gamingArea} />;
  }
  return <></>;
}
