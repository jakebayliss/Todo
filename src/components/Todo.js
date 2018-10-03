import React from 'react';
import TodoList from './TodoList';
import HTML5Backend from 'react-dnd-html5-backend'
import { DragDropContext } from 'react-dnd';
import '../styles/app.css';
import update from 'immutability-helper';
 
class Todo extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            title: '',
            lists: []
        };
    }

    listOnChange = (e) => {
        if(e.key === 'Enter'){
            this.createList();
            return;
        }
        this.setState({title: e.target.value});
    }

    createList = () => {
        if(this.state.title){
            let newList = {
                title: this.state.title,
                key: Date.now(),
                index: this.state.lists.length
            };
            this.setState({
                lists: [...this.state.lists, newList],
                title: ''
            });
        }
    }

    deleteList = (key) => {
        let index = this.state.lists.findIndex(list => list.key === key);
        let lists = this.state.lists;
        lists.splice(index, 1);
        this.setState({ lists: lists});
    }

    editList = (key, title) => {
        let index = this.state.lists.findIndex(list => list.key === key);
        let lists = this.state.lists;
        lists[index].title = title;
        this.setState({ lists: lists });
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
                <h1>Yeet.</h1>
                <div className="create-list">
                    <input autoFocus type="text" className="list-text" placeholder="Create a new list" value={this.state.title} onChange={this.listOnChange} onKeyPress={this.listOnChange} />
                    <button className="list-button" onClick={this.createList}>Create</button>
                </div>
                <div className="lists">
                    {this.state.lists.map(list => (
                        <TodoList list={list} title={list.title} id={list.id} key={list.key} index={list.index} editList={(key, title) => this.editList(key, title)}
                            deleteList={this.deleteList.bind(this, list.key)} moveList={this.moveList} resetIndex={this.resetIndex}/>
                    ))}
                </div>
            </div>
        );
    }
}

export default DragDropContext(HTML5Backend)(Todo)
//export default Todo;