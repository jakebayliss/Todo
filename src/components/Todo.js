import React from 'react';
import List from './List';
import HTML5Backend from 'react-dnd-html5-backend'
import { DragDropContext } from 'react-dnd';
import '../styles/app.css';
import update from 'immutability-helper';
import firebase from '../config/firebase';
import "firebase/auth";
import 'firebase/firestore';

class Todo extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            user: JSON.parse(localStorage.getItem('user')),
            title: '',
            lists: [],
            loading: true
        };
        
        this.db = firebase.firestore();
        this.db.settings({
            timestampsInSnapshots: true
        });
        this.ref = this.db.collection('lists');
    }
    
    componentDidMount = () => {
        if(this.state.user) {
            this.onCollectionUpdate();
        }
    }

    onCollectionUpdate = () => {
        let self = this;
        const lists = [];

        this.ref.where('uid', '==', self.state.user.uid).get()
            .then(function(querySnapshot) {
                querySnapshot.forEach((doc) => {
                    lists.push({
                        id: doc.id,
                        uid: self.state.user.uid,
                        title: doc.data().title,
                        added: doc.data().added
                    });
                });
            })
            .then(function() {
                self.setState({
                    lists: lists,
                    loading: false,
                });
            })
            .catch(error => console.log(error));
    }
        
    listOnChange = (e) => {
        if(e.key === 'Enter'){
            this.createList();
            return;
        }
        this.setState({ title: e.target.value });
    }

    createList = () => {
        let list = {
            uid: this.state.user.uid,
            title: this.state.title,
            added: Date.now()
        }
        let self = this;

        this.ref.add(list)
            .then(function() {
                list.id = self.ref.doc().id;
                const prevLists = self.state.lists;
                prevLists.push(list);
                self.setState({ lists: prevLists, title: '' });
            })
            .catch(error => console.log(error));
    }

    deleteList = (id) => {
        let prevLists = this.state.lists;
        this.ref.doc(id).delete();
        const index = prevLists.findIndex(list => list.id === id);
        if(index) {
            prevLists.splice(index, 1);
        }
        this.setState({ lists: prevLists });
    }

    editList = (id, newTitle) => {
        //this.database.child(id).update({ title: newTitle });
    }

    moveList = (dragIndex, hoverIndex) => {
        const { lists } = this.state
        const dragList = lists[dragIndex]

		this.setState(
			update(this.state, {
				lists: {
					$splice: [[dragIndex, 1], [hoverIndex, 0, dragList]],
				},
			}),
        );
    }

    resetIndex = () => {
        var lists = this.state.lists;
        lists.map((list, i) => {
            list.index = i;
        });
        this.setState({ lists: lists });
    }

    render(){
        return (
            <div className="container">
                <div className="create-list">
                    <input autoFocus type="text" className="list-text" placeholder="What's on your mind" value={this.state.title} onChange={this.listOnChange} onKeyPress={this.listOnChange} />
                    <button className="list-button" onClick={this.createList}>Create</button>
                </div>
                <div className="lists">
                    {this.state.lists.map(list => (
                        <List list={list} title={list.title} id={list.id} key={list.id} index={list.index} editList={(id, title) => this.editList(id, title)}
                            deleteList={this.deleteList.bind(this, list.id)} moveList={this.moveList} resetIndex={this.resetIndex} uid={this.state.uid}/>
                    ))}
                </div>
            </div>
        );
    }
}

export default DragDropContext(HTML5Backend)(Todo);