/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { useInteractable, useGamingAreaController } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import GamingAreaController from '../../../classes/GamingAreaController';
import BlackjackArea from './GamingArea';
import { BlackjackPlayer, PlayingCard } from '../../../types/CoveyTownSocket';

/**
 * Converts a PlayingCard into an id
 * @param card playing card with suit and value
 * @returns card id
 */
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

/**
 * Returns an Image with a given cardId
 * @param props cardId, position
 * @returns an image of the card
 */
export function PlayingCardImage({ cardId, x, y }: { cardId: number; x: number; y: number }) {
  const cardIdString = ('0' + cardId).slice(-2);
  const card = `assets/blackjack/playingcards/playingcards_${cardIdString}.png`;
  return (
    <Image
      data-testid='playingCardImage'
      width='64px'
      position='absolute'
      src={card}
      top={y + 'px'}
      left={x + 'px'}
    />
  );
}

/**
 * Returns a Hand of cards
 * @param props playing cards, position
 * @returns a Hand of cards
 */
export function Hand({ cards, x, y }: { cards: PlayingCard[]; x: number; y: number }) {
  const handComponent = cards.map((card, index) => {
    return (
      <PlayingCardImage key={index} cardId={cardToId(card)} x={x + index * 25} y={y + index * 25} />
    );
  });
  return (
    <Container data-testid='hand'>
      <Image
        data-testid='marker'
        position='absolute'
        src='assets/blackjack/marker.png'
        top={y}
        left={x}
        width='50px'
      />
      {handComponent}
    </Container>
  );
}

export function Hands({ hands, userID }: { hands: BlackjackPlayer[]; userID: string }) {
  const positions = [
    [100, 175],
    [100, 325],
    [860, 175],
    [860, 325],
  ];
  let offset = 0;
  const handComponents = hands.map((hand, index) => {
    if (hand.id == userID) {
      offset = -1;
      return <Hand key={index} cards={hand.hand} x={450} y={400} />;
    } else {
      return (
        <Hand
          key={index}
          cards={hand.hand}
          x={positions[index + offset][0]}
          y={positions[index + offset][1]}
        />
      );
    }
  });
  if (!hands.map(hand => hand.id).includes(userID)) {
    handComponents.push(<Hand key={handComponents.length} cards={[]} x={450} y={400} />);
    offset = -1;
  }
  for (let i = handComponents.length; i < 5; i++) {
    handComponents.push(
      <Hand key={i} cards={[]} x={positions[i + offset][0]} y={positions[i + offset][1]} />,
    );
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
  isPlaying,
}: {
  chipValue: number;
  x: number;
  y: number;
  controller: GamingAreaController;
  currBettingAmount: number;
  setBettingAmount: Dispatch<SetStateAction<number>>;
  isPlaying: boolean;
}) {
  const townController = useTownController();
  const toast = useToast();

  const updateBetting = () => {
    if (isPlaying) {
      const newBetValue: number = chipValue + currBettingAmount;
      setBettingAmount(newBetValue);
      townController.emitGamingAreaUpdate(controller);
    } else {
      const alert = 'Cannot place a bet before joining game!';
      toast({
        title: alert,
        status: 'error',
        duration: 2000,
        isClosable: false,
      });
    }
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
      aria-label={'chip'}
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
  if (!isPlaying) {
    return (
      <Button
        data-testid='joinButton'
        size='sm'
        left='50px'
        top='50px'
        colorScheme='gray'
        position='absolute'
        onClick={() => {
          joinLeaveFunc();
        }}>
        Join
      </Button>
    );
  } else {
    return (
      <Button
        data-testid='leaveButton'
        size='sm'
        left='50px'
        top='50px'
        colorScheme='gray'
        position='absolute'
        onClick={() => {
          joinLeaveFunc();
        }}>
        Leave
      </Button>
    );
  }
}

export function Blackjack({ controller }: { controller: GamingAreaController }) {
  const townController = useTownController();
  const [dealer, setDealerHand] = useState<BlackjackPlayer>(controller.dealer);
  const [players, setBlackjackPlayers] = useState<BlackjackPlayer[]>(controller.players);
  const [timestamp, setTimestamp] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [startGameText, setStartGameText] = useState<string>('Start Game');
  const [bettingAmount, setBettingAmount] = useState<number>(controller.bettingAmount);

  const toast = useToast();

  useEffect(() => {
    const setNewDealerHand = (hand: BlackjackPlayer) => {
      setDealerHand(hand);
      setStartGameText(hand.gameStatus == 'Waiting' ? 'Start Game' : 'Game In Progress');
    };
    controller.addListener('dealerChange', setNewDealerHand);
    return () => {
      controller.removeListener('dealerChange', setNewDealerHand);
    };
  }, [controller, townController]);

  useEffect(() => {
    const setNewBlackjackPlayers = (hands: BlackjackPlayer[]) => {
      setBlackjackPlayers(hands);
      setIsPlaying(hands.map(hand => hand.id).includes(townController.userID));
    };
    controller.addListener('playersChange', setNewBlackjackPlayers);
    return () => {
      controller.removeListener('playersChange', setNewBlackjackPlayers);
    };
  }, [controller, townController]);

  useEffect(() => {
    const alertPlayer = (playing: boolean) => {
      const alert = playing ? "Can't join an active game!" : "Can't leave a game you have started!";
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
        isPlaying={isPlaying}
      />
      <Button
        data-testid='hitButton'
        size='sm'
        left='200px'
        top='500px'
        colorScheme='gray'
        position='relative'
        onClick={() => {
          controller.update = {
            id: townController.userID,
            action: 'Hit',
            timestamp: timestamp + '',
          };
          setTimestamp(prevState => prevState + 1);
          townController.emitGamingAreaUpdate(controller);
        }}>
        Hit
      </Button>
      <Button
        data-testid='standButton'
        size='sm'
        left='240px'
        top='500px'
        colorScheme='gray'
        position='relative'
        onClick={() => {
          controller.update = {
            id: townController.userID,
            action: 'Stay',
            timestamp: timestamp + '',
          };
          setTimestamp(prevState => prevState + 1);
          townController.emitGamingAreaUpdate(controller);
        }}>
        Stand
      </Button>
      <Button
        data-testid='startGameButton'
        size='sm'
        left='120px'
        top='50px'
        colorScheme='gray'
        position='absolute'
        onClick={() => {
          controller.update = {
            id: townController.userID,
            action: 'Start',
            timestamp: timestamp + '',
          };
          setTimestamp(prevState => prevState + 1);
          townController.emitGamingAreaUpdate(controller);
        }}>
        {startGameText}
      </Button>
      <Text top={550} left={375} position='absolute' color='white'>
        {(() => {
          switch (players.find(x => x.id == townController.userID)?.gameStatus) {
            case 'Won':
              return 'You Win!';
            case 'Lost':
              return 'You Lost :C';
            case 'Staying':
              return 'Standing...';
            case 'Waiting':
              return 'Waiting to Start Game...';
            default:
              return '';
          }
        })()}
      </Text>
      <Hand cards={dealer.hand} x={450} y={100} />
      <Hands hands={players} userID={townController.userID} />
      <Chip
        chipValue={1}
        x={600}
        y={480}
        controller={controller}
        currBettingAmount={bettingAmount}
        setBettingAmount={setBettingAmount}
        isPlaying={players.map(player => player.id).includes(townController.userID)}
      />
      <Chip
        chipValue={5}
        x={650}
        y={480}
        controller={controller}
        currBettingAmount={bettingAmount}
        setBettingAmount={setBettingAmount}
        isPlaying={players.map(player => player.id).includes(townController.userID)}
      />
      <Chip
        chipValue={25}
        x={700}
        y={480}
        controller={controller}
        currBettingAmount={bettingAmount}
        setBettingAmount={setBettingAmount}
        isPlaying={players.map(player => player.id).includes(townController.userID)}
      />
      <Chip
        chipValue={100}
        x={750}
        y={480}
        controller={controller}
        currBettingAmount={bettingAmount}
        setBettingAmount={setBettingAmount}
        isPlaying={players.map(player => player.id).includes(townController.userID)}
      />
      <Chip
        chipValue={500}
        x={800}
        y={480}
        controller={controller}
        currBettingAmount={bettingAmount}
        setBettingAmount={setBettingAmount}
        isPlaying={players.map(player => player.id).includes(townController.userID)}
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

export function BlackjackModal({ gamingArea }: { gamingArea: BlackjackArea }): JSX.Element {
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
        <ModalHeader></ModalHeader>
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
  const gamingArea = useInteractable<BlackjackArea>('gamingArea');
  if (gamingArea) {
    return <BlackjackModal gamingArea={gamingArea} />;
  }
  return <></>;
}
