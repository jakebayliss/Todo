import React from 'react';
import { DragSource } from 'react-dnd';
import '../styles/task.css';

const taskSource = {
    beginDrag(props) {
        return (
            props.task
        );
    },
    endDrag(props, monitor, component) {
        if(!monitor.didDrop()){
            return;
        }
        return props.handleDrop(props.task.key);
    }
}

function collect(connect, monitor) {
    return {
      connectDragSource: connect.dragSource(),
      connectDragPreview: connect.dragPreview(),
      isDragging: monitor.isDragging()
    };
  }

class Task extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            done: false,
            title: '',
            previousValue: ''
        }
    }

    componentDidMount = () => {
        this.setState({ title: this.props.task.text, editing: false });
    }

    completeTask = () => {
        if(this.state.done) {
            this.props.completeTask(this.props.task.key, false);
            this.setState({ done: false });
            return;
        }
        this.props.completeTask(this.props.task.key, true);
        this.setState({ done: true });
    }

    deleteTask = (key) => {
        this.props.delete(key);
    }

    handleEdit = () => {
        this.setState({ editing: true, previousValue: this.state.title });
        document.getElementById(this.state.title).focus();
    }

    handleTaskChange = (e) => {
        this.setState({ title: e.target.value })
    }

    handleDone = (e) => {
        if(e.key === 'Enter'){
            if(!this.state.title) {
                this.setState({title: this.state.previousValue});
            }
            this.props.editTask(this.props.task.key, this.state.title);
            this.setState({ editing: false });
        }
    }

    render(){
        const { isDragging, connectDragSource } = this.props;
        const opacity = isDragging ? 0 : 1;
        let viewDisplay = {};
        let editDisplay = {};

        if(this.state.editing) {
            viewDisplay.display = 'none';
        }
        else {
            editDisplay.display = 'none';
        }

        return connectDragSource(
            <div draggable={!this.state.editing} className="task-container">
                <li className={this.state.done ? "task done" : "task"} style={{ opacity }} onDoubleClick={this.handleEdit} style={viewDisplay}>
                    {this.state.title}
                    <input hidden={this.props.deleting} className="task-checkbox" checked={this.state.done} type="checkbox" onChange={this.completeTask} />
                    <button className="delete-task-button" hidden={!this.props.deleting} onClick={this.deleteTask.bind(this, this.props.task.key)}>X</button>
                </li>
                <input type="text" autoFocus id={this.state.title} className="task-title edit" style={editDisplay} value={this.state.title} 
                    onChange={this.handleTaskChange} onKeyDown={this.handleDone}/>
            </div>
        );
    }
}

export default DragSource('task', taskSource, collect)(Task);