import React from 'react';
import Task from './Task';
import Bin from './Bin';
import HTML5Backend from 'react-dnd-html5-backend'
import { DragDropContext } from 'react-dnd'
import '../styles/todolist.css';

class TodoList extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            text: '',
            title: '',
            previousValue: '',
            editing: false,
            deleting: false,
            tasks: props.tasks
        }
    }

    componentDidMount = () => {
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
                key: Date.now()
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
            this.setState({ editing: false });
        }
    }

    handleTitleChange = (e) => {
        this.setState({ title: e.target.value });
    }

    deleteTask = (key) => {
        let index = this.state.tasks.findIndex(task => task.key === key);
        let tasks = this.state.tasks;
        tasks.splice(index, 1);
        this.setState({ tasks: tasks});

        if(this.state.tasks.length == 0) {
            this.setState({ deleting: false });
        }
    }

    handleTaskDeleting = () => {
        if(this.state.deleting) {
            this.setState({ deleting: false });
            return;
        }
        this.setState({ deleting: true });
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
                    <h2 className="list-title" value={this.state.title} onDoubleClick={this.handleEdit} style={viewDisplay}>{this.state.title}</h2>
                    <input autoFocus className="list-title edit" value={this.state.title} type="text" onKeyDown={this.handleDone} onChange={this.handleTitleChange} style={editDisplay} />
                    <button className="remove-list-button" onClick={this.props.deleteList}>X</button>
                </div>
                <div className="add-task">
                    <input type="text" className="task-text" placeholder="What ya needa do" value={this.state.text} onChange={this.taskOnChange} onKeyDown={this.taskOnChange} />
                    <button className="task-button" onClick={this.addTask}>Add</button>
                </div>
                <ul className ="tasks">
                    {this.state.tasks.map(task => (
                        <Task task={task} key={task.key} handleDrop={(id) => this.deleteTask(id)} deleting={this.state.deleting} delete={(key) => this.deleteTask(key)}/>
                    ))}
                </ul>
                {this.state.tasks.length > 0 && (
                    <Bin deleting={this.handleTaskDeleting} value={this.state.deleting}/>
                )}
            </div>
        );
    }
}

export default DragDropContext(HTML5Backend)(TodoList)