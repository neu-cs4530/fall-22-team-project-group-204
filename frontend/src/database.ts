import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyCtj2FEI1z7y2L98RES_x3AEZUsWpT2NoQ',
  authDomain: 'covey-town-blackjack-firebase.firebaseapp.com',
  projectId: 'covey-town-blackjack-firebase',
  storageBucket: 'covey-town-blackjack-firebase.appspot.com',
  messagingSenderId: '23219789710',
  appId: '1:23219789710:web:a048d6af6d3bab06b38edf',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export default getFirestore(app);
