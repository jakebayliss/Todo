import React from 'react';
import Task from './Task';
import '../styles/todolist.css';

class TodoList extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            text: '',
            tasks: props.tasks
        }
    }

    taskOnChange = (e) => {
        console.log(e.key);
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
        return (
            <div className="list">
                <h2>{this.props.title}</h2>
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