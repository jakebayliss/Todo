import app from 'firebase';
import 'firebase/auth';
import 'firebase/firebase-firestore';

const DB_CONFIG = {
    apiKey: "AIzaSyAx-EGlbALd2SKBz5UyGkfjYxsbDfMIOc0",
    authDomain: "limitlist-6ac62.firebaseapp.com",
    databaseURL: "https://limitlist-6ac62.firebaseio.com",
    projectId: "limitlist-6ac62",
    storageBucket: "limitlist-6ac62.appspot.com",
    messagingSenderId: "781553856532"
};

class Firebase {
    constructor() {
      app.initializeApp(DB_CONFIG);

      this.auth = app.auth();
      this.db = app.firestore();
    }

    register = async (username, email, password) => {
      await this.auth.createUserWithEmailAndPassword(email, password);
      return this.auth.currentUser.updateProfile({
        displayName: username
      });
    }

    login = async (email, password) => await this.auth.signInWithEmailAndPassword(email, password);

    logout = async () => await this.auth.signOut();

    getLists = async (uid) => {
      let lists = [];
      await this.db.collection('lists').where('uid', '==', uid).get()
        .then((snapshot) => {
          snapshot.forEach(doc => 
            lists.push({
              id: doc.id,
              uid: uid,
              title: doc.data().title,
              added: doc.data().added
            })
        )});
      return lists;
    };

    getItems = async (listId) => {
      let items = [];
      await this.db.collection('items').where('listId', '==', listId).get()
        .then(function(querySnapshot) {
            querySnapshot.forEach((doc) => {
                items.push(doc.data());
            });
        });
      return items
    };
}

export default new Firebase();