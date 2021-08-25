import app from 'firebase';

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

    checkForUser = async () => {
      debugger;
      var user = {};
      this.auth.onAuthStateChanged(user => {
        user = user;
      });
      return user;
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
        .then(snapshot => {
          snapshot.forEach(doc => 
            items.push({
              listId: listId,
              id: doc.id,
              text: doc.data().text,
              notes: doc.data().notes,
              done: doc.data().done,
              index: doc.data().index,
              added: doc.data().added,
              updated: doc.data().updated
            })
        )});
      return items;
    };

    createList = async (list) => {
      const response = await this.db.collection('lists').add(list);
      return response.id;
    }

    updateList = async (id, title) => {
      await this.db.collection('lists').doc(id).update({ title: title });
    }

    deleteList = async (id) => {
      await this.db.collection('lists').doc(id).delete();
    }

    addItem = async (item) => {
      const response = await this.db.collection('items').add(item);
      return response.id;
    }

    updateItem = async (item) => {
      await this.db.collection('items').doc(item.id).update({ text: item.text, notes: item.notes, updated: Date.now() });
    }

    deleteItem = async (id) => {
      await this.db.collection('items').doc(id).delete();
    }
}

export default new Firebase();