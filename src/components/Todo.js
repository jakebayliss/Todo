import React from 'react';
import TodoList from './TodoList';
import HTML5Backend from 'react-dnd-html5-backend'
import { DragDropContext } from 'react-dnd';
import '../styles/app.css';
import update from 'immutability-helper';
import firebase from '../config/firebase';
import 'firebase/database';
 
class Todo extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            user: props.user,
            uid: props.uid,
            title: '',
            lists: []
        };

        this.database = firebase.database().ref().child(`users/${this.state.uid}/lists`);
    }
    
    componentWillMount = () => {
        if(this.state.user) {
            const previousLists = this.state.lists;

            this.database.on('child_added', snap => {
                previousLists.push({
                    id: snap.key,
                    title: snap.val().title
                });
                this.setState({ lists: previousLists, title: '' });
            });

            this.database.on('child_changed', snap => {
                const index = previousLists.findIndex(list => list.id === snap.key);
                previousLists[index].title = snap.val().title;
                this.setState({ lists: previousLists });
            })

            this.database.on('child_removed', snap => {
                const index = previousLists.findIndex(list => list.id === snap.key);
                previousLists.splice(index, 1);
                this.setState({ lists: previousLists });
            });
        }
    };

    populate = () => {
        
    }

    listOnChange = (e) => {
        if(e.key === 'Enter'){
            this.createList();
            return;
        }
        this.setState({ title: e.target.value });
    }

    createList = () => {
        this.database.push().set({ title: this.state.title });
    }

    deleteList = (id) => {
        this.database.child(id).remove();
    }

    editList = (id, newTitle) => {
        this.database.child(id).update({ title: newTitle });
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
                        <TodoList list={list} title={list.title} id={list.id} key={list.id} index={list.index} editList={(id, title) => this.editList(id, title)}
                            deleteList={this.deleteList.bind(this, list.id)} moveList={this.moveList} resetIndex={this.resetIndex} uid={this.state.uid}/>
                    ))}
                </div>
            </div>
        );
    }
}

export default DragDropContext(HTML5Backend)(Todo);