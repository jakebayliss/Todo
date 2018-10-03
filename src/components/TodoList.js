import React from 'react';
import Task from './Task';
import Bin from './Bin';
import HTML5Backend from 'react-dnd-html5-backend'
import { DragDropContext } from 'react-dnd'
import '../styles/todolist.css';
import update from 'immutability-helper';

class TodoList extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            text: '',
            title: '',
            previousValue: '',
            editing: false,
            tasks: [],
            completedTasks: 0
        }
    }

    componentDidMount = () => {
        document.getElementById(this.props.title + "-text").focus();
        this.setState({ title: this.props.title, previousValue: this.props.title })
    }

    taskOnChange = (e) => {
        if(e.key === 'Enter'){
            this.addTask();
            return;
        }
        this.setState({ text: e.target.value });
    }

    addTask = () => {
        if(this.state.text){
            let newTask = {
                text: this.state.text,
                key: Date.now(),
                done: false,
                index: this.state.tasks.length
            };
            this.setState({
                tasks: [...this.state.tasks, newTask],
                text: ''
            });
        }
    }

    handleEdit = () => {
        this.setState({ editing: true, previousValue: this.state.title });
    }

    handleDone = (e) => {
        if(e.key === 'Enter'){
            if(!this.state.title) {
                this.setState({title: this.state.previousValue});
            }
            this.props.editList(this.props.id, this.state.title);
            this.setState({ editing: false });
        }
    }

    handleTitleChange = (e) => {
        this.setState({ title: e.target.value });
    }

    deleteTask = (key) => {
        let index = this.state.tasks.findIndex(task => task.key === key);
        let tasks = this.state.tasks;

        if(tasks[index]){
            if(!tasks[index].done){
                this.updateTaskCounter(null);
            }
            else {
                this.updateTaskCounter(true);
            }
        }

        tasks.splice(index, 1);
        this.setState({ tasks: tasks });

        if(this.state.tasks.length == 0) {
            this.setState({ completedTasks: 0 });
        }
    }

    editTask = (key, title) => {
        let index = this.state.tasks.findIndex(task => task.key === key);
        let tasks = this.state.tasks;
        tasks[index].title = title;
        this.setState({ tasks: tasks });
    }

    completeTask = (key, value) => {
        let index = this.state.tasks.findIndex(task => task.key === key);
        let tasks = this.state.tasks;

        this.updateTaskCounter(value);

        tasks[index].done = true;
        this.setState({ tasks: tasks });
    }

    updateTaskCounter = (done) => {
        if(done == false) {
            this.setState({ completedTasks: this.state.completedTasks + 1 });
            return;
        }
        if(done && this.state.completedTasks > 0) {
            this.setState({ completedTasks: this.state.completedTasks - 1 });
        }
    }

    moveTask = (dragIndex, hoverIndex) => {
        const { tasks } = this.state
        const dragTask = tasks[dragIndex]

		this.setState(
			update(this.state, {
				tasks: {
					$splice: [[dragIndex, 1], [hoverIndex, 0, dragTask]],
				},
			}),
        );
    }
    
    resetIndex = () => {
        var tasks = this.state.tasks;
        tasks.map((task, i) => {
            task.index = i;
        });
        this.setState({ tasks: tasks });
    }

    render() {
        let viewDisplay = {};
        let editDisplay = {};

        if(this.state.editing) {
            viewDisplay.display = 'none';
        }
        else {
            editDisplay.display = 'none';
        }
        return (
            <div className="list">
                <div className="list-banner">
                    {this.state.tasks.length > 0 && (
                        <p className="counter">{this.state.completedTasks}/{this.state.tasks.length}</p>
                    )}
                    <h2 className="list-title" value={this.state.title} onDoubleClick={this.handleEdit} style={viewDisplay}>{this.state.title}</h2>
                    <input className="list-title edit" value={this.state.title} type="text" onKeyDown={this.handleDone} 
                        onChange={this.handleTitleChange} style={editDisplay} />
                    <button className="remove-list-button" onClick={this.props.deleteList}>&times;</button>
                </div>
                <div className="add-task">
                    <input type="text" id={this.props.title + "-text"} className="task-text" placeholder="What ya needa do" 
                        value={this.state.text} onChange={this.taskOnChange} onKeyDown={this.taskOnChange} />
                    <button className="task-button" onClick={this.addTask}>&#43;</button>
                </div>
                <ul className ="tasks">
                    {this.state.tasks.map(task => (
                        <Task task={task} key={task.key} index={task.index} moveTask={this.moveTask} editTask={(key, title) => this.editTask(key, title)} completeTask={(key, value) => this.completeTask(key, value)}
                            delete={(key) => this.deleteTask(key)} 
                            resetIndex={this.resetIndex}/>
                    ))}
                </ul>
            </div>
        );
    }
}

export default DragDropContext(HTML5Backend)(TodoList)