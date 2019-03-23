import Firebase from 'firebase';

var config = {
    apiKey: "AIzaSyDvWRml9rDntPcHREhQiBOR2qvs5tiGRPU",
    authDomain: "arborhacks-1552775199777.firebaseapp.com",
    databaseURL: "https://arborhacks-1552775199777.firebaseio.com",
    projectId: "arborhacks-1552775199777",
    storageBucket: "arborhacks-1552775199777.appspot.com",
    messagingSenderId: "454241223677"
};
Firebase.initializeApp(config);
export const provider = new Firebase.auth.GoogleAuthProvider();
export const auth = Firebase.auth();
export default Firebase;