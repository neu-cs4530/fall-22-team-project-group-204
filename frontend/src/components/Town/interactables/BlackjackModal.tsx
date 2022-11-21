/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box,
  Button,
  Container,
  IconButton,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useToast,
} from '@chakra-ui/react';
import React, { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import GamingAreaController from '../../../classes/GamingAreaController';
import { useGamingAreaController, useInteractable } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import { PlayerHand, PlayingCard } from '../../../types/CoveyTownSocket';
import GamingArea from './GamingArea';

// i need to figure out how the back and front end communicate :C

// import Value, { getValueNumbers } from '../../../../../townService/src/games/cards/Value';
// import Suit from '../../../../../townService/src/games/cards/Suit';

function cardToId(card: PlayingCard): number {
  if (card.faceUp == false) {
    return 53;
  }
  const value = card.value;
  const suit = card.suit;
  const valueMap = new Map<string, number>([
    ['A', 13],
    ['K', 12],
    ['Q', 11],
    ['J', 10],
    ['10', 9],
    ['9', 8],
    ['8', 7],
    ['7', 6],
    ['6', 5],
    ['5', 4],
    ['4', 3],
    ['3', 2],
    ['2', 1],
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
  throw new Error('Value not found in table: ' + value);
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

export function PlayingCardImage({ cardId, x, y }: { cardId: number; x: number; y: number }) {
  const cardIdString = ('0' + cardId).slice(-2);
  const card = `assets/blackjack/playingcards/playingcards_${cardIdString}.png`;
  return <Image width='64px' position='absolute' src={card} top={y + 'px'} left={x + 'px'} />;
}

export function Hand({ cards, x, y }: { cards: PlayingCard[]; x: number; y: number }) {
  const handComponent = cards.map((card, index) => {
    return (
      <PlayingCardImage key={index} cardId={cardToId(card)} x={x + index * 25} y={y + index * 25} />
    );
  });
  return (
    <Container>
      <Image position='absolute' src='assets/blackjack/marker.png' top={y} left={x} width='50px' />
      {handComponent}
    </Container>
  );
}

export function Hands({ hands }: { hands: PlayerHand[] }) {
  const townController = useTownController();
  const positions = [
    [100, 175],
    [100, 325],
    [860, 175],
    [860, 325],
  ];
  let offset = 0;
  const handComponents = hands.map((hand, index) => {
    if (hand.id == townController.userID) {
      offset = -1;
      return <Hand cards={hand.hand} x={450} y={400} />;
    } else {
      return (
        <Hand cards={hand.hand} x={positions[index + offset][0]} y={positions[index + offset][1]} />
      );
    }
  });
  for (let i = hands.length; i < 5; i++) {
    if (i == 0) {
      handComponents.push(<Hand cards={[]} x={450} y={400} />);
      offset = -1;
    } else {
      handComponents.push(
        <Hand cards={[]} x={positions[i + offset][0]} y={positions[i + offset][1]} />,
      );
    }
  }
  return <Container>{handComponents}</Container>;
}

export function Chip({
  chipValue,
  x,
  y,
  controller,
  currBettingAmount,
  setBettingAmount,
}: {
  chipValue: number;
  x: number;
  y: number;
  controller: GamingAreaController;
  currBettingAmount: number;
  setBettingAmount: Dispatch<SetStateAction<number>>;
}) {
  const townController = useTownController();

  const updateBetting = () => {
    const newBetValue: number = chipValue + currBettingAmount;
    setBettingAmount(newBetValue);
    townController.emitGamingAreaUpdate(controller);
  };

  const chip = `assets/blackjack/chips/chip_${chipValue}.png`;
  return (
    <IconButton
      onClick={updateBetting}
      variant='ghost'
      position='absolute'
      colorScheme='ghost'
      // _focus={{ boxShadow: 'none' }} # do we want box shadow when clicking chips?
      top={y + 'px'}
      left={x + 'px'}
      icon={<Image width='40px' src={chip} />}
      aria-label={''}
    />
  );
}

export function JoinLeaveButton({
  joinLeaveFunc,
  isPlaying,
}: {
  joinLeaveFunc: () => boolean;
  isPlaying: boolean;
}) {
  const [joinLeave, setJoinLeave] = useState<boolean>(!isPlaying);

  if (joinLeave) {
    return (
      <Button
        size='sm'
        left='50px'
        top='50px'
        colorScheme='gray'
        position='absolute'
        onClick={() => {
          const success = joinLeaveFunc();
          if (success) {
            setJoinLeave(false);
          }
        }}>
        Join
      </Button>
    );
  } else {
    return (
      <Button
        size='sm'
        left='50px'
        top='50px'
        colorScheme='gray'
        position='absolute'
        onClick={() => {
          const success = joinLeaveFunc();
          if (success) {
            setJoinLeave(true);
          }
        }}>
        Leave
      </Button>
    );
  }
}

export function Blackjack({ controller }: { controller: GamingAreaController }) {
  const townController = useTownController();
  const [dealerHand, setDealerHand] = useState<PlayingCard[]>(controller.dealerHand);
  const [playerHands, setPlayerHands] = useState<PlayerHand[]>(controller.playerHands);
  const [gameStatus, setGameStatus] = useState<string>(controller.gameStatus);
  const [bettingAmount, setBettingAmount] = useState<number>(controller.bettingAmount);

  const toast = useToast();

  useEffect(() => {
    console.log(controller.id);
  });

  useEffect(() => {
    const setNewDealerHand = (hand: PlayingCard[]) => {
      setDealerHand(hand);
    };
    controller.addListener('dealerHandChange', setNewDealerHand);
    return () => {
      controller.removeListener('dealerHandChange', setNewDealerHand);
    };
  }, [controller, townController]);

  useEffect(() => {
    const setNewPlayerHands = (hands: PlayerHand[]) => {
      setPlayerHands(hands);
    };
    controller.addListener('playerHandsChange', setNewPlayerHands);
    return () => {
      controller.removeListener('playerHandsChange', setNewPlayerHands);
    };
  }, [controller, townController]);

  useEffect(() => {
    const setNewGameStatus = (status: string) => {
      setGameStatus(status);
    };
    controller.addListener('gameStatusChange', setNewGameStatus);
    return () => {
      controller.removeListener('gameStatusChange', setNewGameStatus);
    };
  }, [controller, townController]);

  useEffect(() => {
    const alertPlayer = (isPlaying: boolean) => {
      const alert = isPlaying
        ? "Can't join an active game!"
        : "Can't leave a game you have started!";
      toast({
        title: alert,
        status: 'error',
        duration: 2000,
        isClosable: false,
      });
    };
    controller.addListener('activeGameAlert', alertPlayer);
    return () => {
      controller.removeListener('activeGameAlert', alertPlayer);
    };
  });

  townController.emitGamingAreaUpdate(controller);
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
      <JoinLeaveButton
        joinLeaveFunc={() => {
          const success = controller.toggleJoinGame(townController.userID);
          townController.emitGamingAreaUpdate(controller);
          return success;
        }}
        isPlaying={playerHands.map(player => player.id).includes(townController.userID)}
      />
      <Button
        size='sm'
        left='200px'
        top='500px'
        colorScheme='gray'
        position='relative'
        onClick={() => {
          hit();
          townController.emitGamingAreaUpdate(controller);
        }}>
        Hit
      </Button>
      <Button size='sm' left='240px' top='500px' colorScheme='gray' position='relative'>
        Stand
      </Button>
      {/*<Hand
        cards={[
          { value: '7', suit: 'Clubs' },
          { value: 'A', suit: 'Spades' },
        ]}
        x={450}
        y={400}
      />*/}
      <Text top={30} left={700} position='absolute' color='white'>
        Game Status: {gameStatus}
      </Text>
      <Hand cards={dealerHand} x={450} y={100} />
      <Hands hands={playerHands} />
      <Chip
        chipValue={1}
        x={600}
        y={480}
        controller={controller}
        currBettingAmount={bettingAmount}
        setBettingAmount={setBettingAmount}
      />
      <Chip
        chipValue={5}
        x={650}
        y={480}
        controller={controller}
        currBettingAmount={bettingAmount}
        setBettingAmount={setBettingAmount}
      />
      <Chip
        chipValue={25}
        x={700}
        y={480}
        controller={controller}
        currBettingAmount={bettingAmount}
        setBettingAmount={setBettingAmount}
      />
      <Chip
        chipValue={100}
        x={750}
        y={480}
        controller={controller}
        currBettingAmount={bettingAmount}
        setBettingAmount={setBettingAmount}
      />
      <Chip
        chipValue={500}
        x={800}
        y={480}
        controller={controller}
        currBettingAmount={bettingAmount}
        setBettingAmount={setBettingAmount}
      />
      <Text as='b' fontSize='md' left='615px' top='450px' position='absolute'>
        1
      </Text>
      <Text as='b' fontSize='md' left='665px' top='450px' position='absolute'>
        5
      </Text>
      <Text as='b' fontSize='md' left='710px' top='450px' position='absolute'>
        25
      </Text>
      <Text as='b' fontSize='md' left='755px' top='450px' position='absolute'>
        100
      </Text>
      <Text as='b' fontSize='md' left='805px' top='450px' position='absolute'>
        500
      </Text>
      <Text as='b' fontSize='md' left='600px' top='400px' position='absolute'>
        Betting Amount: {bettingAmount}
      </Text>
      <Button size='sm' left='660px' top='535px' colorScheme='gray' position='absolute'>
        Bet
      </Button>
      <Button
        size='sm'
        left='730px'
        top='535px'
        colorScheme='gray'
        position='absolute'
        onClick={() => {
          setBettingAmount(0);
          townController.emitGamingAreaUpdate(controller);
        }}>
        Clear
      </Button>
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
        <ModalCloseButton />
        <ModalBody>
          <Blackjack controller={gamingAreaController} />
        </ModalBody>
        <ModalFooter> </ModalFooter>
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
