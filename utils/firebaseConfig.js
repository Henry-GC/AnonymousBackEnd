// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBespyFwDg7Nk3sYA3e-Y64uryrUVSXHxU",
  authDomain: "anonymous-pc-9aa9d.firebaseapp.com",
  projectId: "anonymous-pc-9aa9d",
  storageBucket: "anonymous-pc-9aa9d.appspot.com",
  messagingSenderId: "954888720565",
  appId: "1:954888720565:web:d94e0656812b780043aefc",
  measurementId: "G-7LGR43B632"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);