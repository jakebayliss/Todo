import React from 'react';
import TodoList from './TodoList';
import Task from './Task';
import '../styles/app.css';
 
class Todo extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            title: '',
            lists: [],
            task: '',
            items: []
        };
    }

    listOnChange = (e) => {
        this.setState({title: e.target.value});
    }

    createList = () => {
        if(this.state.title){
            this.setState({
                title: '',
                lists: [...this.state.lists, this.state.title]
            });
        }
    }

    taskOnChange = (e) => {
        this.setState({task: e.target.value});
    }

    addTask = () => {
        if(this.state.task){
            let newTask = {
                text: this.state.task,
                key: Date.now()
            };
            this.setState({
                items: [...this.state.items, newTask],
                task: ''
            });
        }
    }

    render(){
        return (
            <div className="container">
                <h1>Yeet.</h1>
                <div className="new-list">
                    <input autoFocus type="text" placeholder="Create a new list" value={this.state.title} onChange={this.listOnChange} />
                    <button onClick={this.createList}>+</button>
                </div>
                {this.state.lists.length > 0 && (
                    <div className="add-item">
                        <input type="text" placeholder="What ya needa do" value={this.state.task} onChange={this.taskOnChange} />
                        <button onClick={this.addTask}>+</button>
                        <Task items={this.state.items} />
                    </div>
                )}
            </div>
        );
    }
}

export default Todo;