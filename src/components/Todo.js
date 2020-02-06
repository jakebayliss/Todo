import React, { useState, useEffect } from 'react';
import List from './List';
import HTML5Backend from 'react-dnd-html5-backend'
import { DragDropContext } from 'react-dnd';
import '../styles/app.css';
import update from 'immutability-helper';
import Firebase from '../config/firebase';

const Todo = (props) => {

    const [user, setUser] = useState(props.user);
    const [listTitle, setListTitle] = useState('');
    const [lists, setLists] = useState();

    useEffect(() => {
        if(user) {
            Firebase.getLists(props.uid).then(lists => {
                setLists(lists);
                console.log(lists);
            });
        }
    });
        
    listTitleOnChange = (e) => {
        if(e.key === 'Enter'){
            this.createList();
            return;
        }
        setListTitle(e.target.value);
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
        let prevLists = lists;
        this.ref.doc(id).delete();
        const index = prevLists.findIndex(list => list.id === id);
        if(index) {
            prevLists.splice(index, 1);
        }
        setlists(prevLists);
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
        var prevLists = lists;
        prevLists.map((list, i) => {
            list.index = i;
        });
        setlists(prevLists);
    }

    return (
        <div className="container">
            <div className="create-list">
                <input autoFocus type="text" className="list-text" placeholder="What's on your mind" value={listTitle} onChange={this.listTitleOnChange} onKeyPress={this.listTitleOnChange} />
                <button className="list-button" onClick={this.createList}>Create</button>
            </div>
            <div className="lists">
                {lists.map(list => (
                    <List list={list}  key={list.id} editList={(id, title) => this.editList(id, title)}
                        deleteList={this.deleteList.bind(this, list.id)} moveList={this.moveList} resetIndex={this.resetIndex} />
                ))}
            </div>
        </div>
    );
}

export default DragDropContext(HTML5Backend)(Todo);