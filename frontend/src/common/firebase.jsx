// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD8Zz-5c7KdTGw9EmLq3j_tJiVHmR6Aajc",
  authDomain: "reactjs-geoprofiles.firebaseapp.com",
  projectId: "reactjs-geoprofiles",
  storageBucket: "reactjs-geoprofiles.appspot.com",
  messagingSenderId: "856201103741",
  appId: "1:856201103741:web:55fca658398a934370e414",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

//Google auth
const provider = new GoogleAuthProvider();

const auth = getAuth();

export const authWithGoogle = async () => {
  let user = null;

  await signInWithPopup(auth, provider)
    .then((result) => {
      user = result.user;
    })
    .catch((err) => {
      console.log(err);
    });

  return user;
};
