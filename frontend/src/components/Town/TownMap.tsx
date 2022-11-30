import { collection, DocumentData, getDocs, orderBy, Query, query } from 'firebase/firestore';
import Phaser from 'phaser';
import React, { useEffect } from 'react';
import db from '../../database';
import useTownController from '../../hooks/useTownController';
import { PlayerStanding } from '../../types/CoveyTownSocket';
import LeaderboardModal from '../Leaderboard/LeaderboardModal';
import SocialSidebar from '../SocialSidebar/SocialSidebar';
import BlackjackModal from './interactables/BlackjackModal';
import NewConversationModal from './interactables/NewCoversationModal';
import TownGameScene from './TownGameScene';

async function getLeaderboardData(
  orderRef: Query<DocumentData>,
  leaderboardData: PlayerStanding[],
) {
  const docsSnap = await getDocs(orderRef);

  let count = 1;
  docsSnap.forEach(doc => {
    const playerRank: PlayerStanding = {
      ranking: count,
      name: doc.data().name,
      wins: doc.data().wins,
      balance: doc.data().balance,
    };
    if (playerRank.name !== undefined) {
      leaderboardData.push(playerRank);
      count += 1;
    }
  });
}

export default function TownMap(): JSX.Element {
  const coveyTownController = useTownController();

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      backgroundColor: '#000000',
      parent: 'map-container',
      render: { pixelArt: true, powerPreference: 'high-performance' },
      scale: {
        expandParent: false,
        mode: Phaser.Scale.ScaleModes.WIDTH_CONTROLS_HEIGHT,
        autoRound: true,
      },
      width: 800,
      height: 600,
      fps: { target: 30 },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 }, // Top down game, so no gravity
        },
      },
    };

    const game = new Phaser.Game(config);
    const newGameScene = new TownGameScene(coveyTownController);
    game.scene.add('coveyBoard', newGameScene, true);
    const pauseListener = newGameScene.pause.bind(newGameScene);
    const unPauseListener = newGameScene.resume.bind(newGameScene);
    coveyTownController.addListener('pause', pauseListener);
    coveyTownController.addListener('unPause', unPauseListener);
    return () => {
      coveyTownController.removeListener('pause', pauseListener);
      coveyTownController.removeListener('unPause', unPauseListener);
      game.destroy(true);
    };
  }, [coveyTownController]);

  // Leaderboard
  const leaderboardData: PlayerStanding[] = [];
  const docRef = collection(db, 'users');
  const orderRef = query(docRef, orderBy('wins', 'desc'), orderBy('balance', 'desc'));
  getLeaderboardData(orderRef, leaderboardData);

  return (
    <div id='app-container'>
      <NewConversationModal />
      <BlackjackModal />
      <LeaderboardModal rankingData={leaderboardData} />
      <div id='map-container' />
      <div id='social-container'>
        <SocialSidebar />
      </div>
    </div>
  );
}
