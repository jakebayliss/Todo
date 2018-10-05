import React from 'react';
import TodoList from './TodoList';
import HTML5Backend from 'react-dnd-html5-backend'
import { DragDropContext } from 'react-dnd';
import '../styles/app.css';
import update from 'immutability-helper';
import { DB_CONFIG } from '../config/firebase';
import firebase from 'firebase/app';
import 'firebase/database';
 
class Todo extends React.Component {
    constructor(props){
        super(props);

        this.app = firebase.initializeApp(DB_CONFIG);
        this.database = this.app.database().ref().child('lists');

        this.state = {
            title: '',
            lists: []
        };
    }

    componentWillMount = () => {
        const previousLists = this.state.lists;

        this.database.on('child_added', snap => {
            previousLists.push({
                id: snap.key,
                title: snap.val().title
            });
            this.setState({ lists: previousLists });
        });

        this.database.on('child_changed', snap => {
            let index = previousLists.findIndex(list => list.id === snap.key);
            previousLists[index].title = snap.val().title;
            this.setState({ lists: previousLists });
        })

        this.database.on('child_removed', snap => {
            let index = previousLists.findIndex(list => list.id === snap.key);
            previousLists.splice(index, 1);
            this.setState({ lists: previousLists });
        });
    };

    listOnChange = (e) => {
        if(e.key === 'Enter'){
            this.createList();
            return;
        }
        this.setState({title: e.target.value});
    }

    createList = () => {
        this.database.push().set({ title: this.state.title });
        this.setState({ title: '' });
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
                <h1>Limitlist</h1>
                <div className="create-list">
                    <input autoFocus type="text" className="list-text" placeholder="Create a new list" value={this.state.title} onChange={this.listOnChange} onKeyPress={this.listOnChange} />
                    <button className="list-button" onClick={this.createList}>Create</button>
                </div>
                <div className="lists">
                    {this.state.lists.map(list => (
                        <TodoList list={list} title={list.title} id={list.id} key={list.id} index={list.index} editList={(id, title) => this.editList(id, title)}
                            deleteList={this.deleteList.bind(this, list.id)} moveList={this.moveList} resetIndex={this.resetIndex}/>
                    ))}
                </div>
            </div>
        );
    }
}

export default DragDropContext(HTML5Backend)(Todo);