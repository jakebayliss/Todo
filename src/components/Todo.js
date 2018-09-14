import React from 'react';
import TodoList from './TodoList';
import '../styles/app.css';
 
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
                tasks: []
            };
            this.setState({
                lists: [...this.state.lists, newList],
                title: ''
            });
        }
    }

    //Not sure if this is terrible or terrible
    deleteList = (key) => {
        let index = this.state.lists.findIndex(list => list.key === key);
        let lists = this.state.lists;
        lists.splice(index, 1);
        this.setState({ lists: lists});
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
                        <TodoList title={list.title} tasks={list.tasks} id={list.key} key={list.key} deleteList={this.deleteList.bind(this, list.key)}/>
                    ))}
                </div>
            </div>
        );
    }
}

export default Todo;