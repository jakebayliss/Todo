import React from 'react';
import Task from './Task';
import EditContentHelper from '../editContentHelper.js';
import '../styles/todolist.css';
import editContentHelper from '../editContentHelper.js';

class TodoList extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            text: '',
            editing: false,
            tasks: props.tasks
        }
    }

    taskOnChange = (e) => {
        if(e.key === 'Enter'){
            this.addTask();
            return;
        }
        this.setState({text: e.target.value});
    }

    addTask = () => {
        if(this.state.text){
            let newTask = {
                text: this.state.text,
                key: Date.now()
            };
            this.setState({
                tasks: [...this.state.tasks, newTask],
                text: ''
            });
        }
    }

    render() {
        let Title = editContentHelper('h2');
        return (
            <div className="list">
                <div className="list-banner">
                    <Title value={this.props.title} className="list-title"/>
                    <button className="remove-list-button" onClick={this.props.removeEvent}>X</button>
                </div>
                <div className="add-task">
                    <input type="text" className="task-text" placeholder="What ya needa do" value={this.state.text} onChange={this.taskOnChange} />
                    <button className="task-button" onClick={this.addTask}>Add</button>
                </div>
                <ul className ="tasks">
                    {this.state.tasks.map(task => (
                        <Task text={task.text} key={task.key} />
                    ))}
                </ul>
            </div>
        );
    }
}

export default TodoList;