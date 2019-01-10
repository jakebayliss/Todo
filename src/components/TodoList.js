import React from 'react';
import Task from './Task';
import { findDOMNode } from 'react-dom';
import { DragSource, DropTarget } from 'react-dnd';
import flow from 'lodash.flow';
import '../styles/todolist.css';
import update from 'immutability-helper';
import firebase from 'firebase/app';
import 'firebase/database';

const listSource = {
    beginDrag(props) {
        return (
            props.list
        );
    },
    // TODO: Sort this out
    endDrag(props, monitor, component) {
        if(!monitor.didDrop()){
            return;
        }
    }
}

// TODO: Customise this method. (DOESNT HANDLE DRAGGING SIDE WAYS!!)
const listTarget = {
	hover(props, monitor, component) {
		if (!component) {
			return null
		}
        const dragIndex = monitor.getItem().index;
		const hoverIndex = props.index;

		// Don't replace items with themselves
		if (dragIndex === hoverIndex) {
			return;
		}

		// Determine rectangle on screen
		const hoverBoundingRect = (findDOMNode(
			component,
		)).getBoundingClientRect();

		// Get vertical middle
		const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

		// Determine mouse position
		const clientOffset = monitor.getClientOffset();

		// Get pixels to the top
		const hoverClientY = (clientOffset).y - hoverBoundingRect.top;

		// Only perform the move when the mouse has crossed half of the items height
		// When dragging downwards, only move when the cursor is below 50%
		// When dragging upwards, only move when the cursor is above 50%
		// Dragging downwards
		if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
			return;
		}

		// Dragging upwards
		if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
			return;
        }

        props.moveList(dragIndex, hoverIndex);
        props.resetIndex();
	}
}

class TodoList extends React.Component {
    constructor(props){
        super(props);
        
        this.database = firebase.database().ref().child(`users/${props.uid}/lists/${this.props.list.id}`);

        this.state = {
            text: '',
            title: '',
            previousValue: '',
            editing: false,
            tasks: [],
            completedTasks: 0
        }
    }

    componentWillMount = () => {
        const previousTasks = this.state.tasks;
        
        this.database.orderByChild('index').on('child_added', snap => {
            if(snap.val().text) {
                previousTasks.push({
                    id: snap.key,
                    text: snap.val().text,
                    notes: snap.val().notes,
                    done: snap.val().done,
                    index: snap.val().index
                });
                this.setState({ tasks: previousTasks });
            }
        });

        this.database.orderByChild('index').on('child_changed', snap => {
            const index = previousTasks.findIndex(task => task.id === snap.key);
            if(snap.val().text) {
                previousTasks[index].text = snap.val().text;
                previousTasks[index].notes = snap.val().notes;
            }
            else if (snap.val().done) {
                previousTasks[index].done = snap.val().done;
            }
            else if (snap.val().index) {
                previousTasks[index].index = snap.val().index;
            }
            this.setState({ tasks: previousTasks });
        });

        this.database.on('child_removed', snap => {
            const index = previousTasks.findIndex(task => task.id === snap.key);
            if(index) {
                this.updateTaskCounter(previousTasks[index].done, true);
                previousTasks.splice(index, 1);
            }
            this.setState({ tasks: previousTasks });
        });
    }

    componentDidMount = () => {
        document.getElementById(this.props.title + "-text").focus();
        this.setState({ title: this.props.title, previousValue: this.props.title });
    }

    taskOnChange = (e) => {
        if(e.key === 'Enter'){
            this.addTask();
            return;
        }
        this.setState({ text: e.target.value });
    }

    addTask = () => {
        if(this.state.text) {
            this.database.push().set({ text: this.state.text, notes: '', done: false, index: this.state.tasks.length });
            this.setState({ text: '' });
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

    deleteTask = (id) => {
        this.database.child(id).remove();
    }

    editTask = (task) => {
        this.database.child(task.id).update({ text: task.text, notes: task.notes });
    }

    toggleCompleted = (id, value) => {
        this.database.child(id).update({ done: value });
        this.updateTaskCounter(value, false);
    }

    updateTaskCounter = (done, deleted) => {
        if(!done && deleted) {
            return;
        }
        if(done) {
            if(deleted) {
                this.setState({ completedTasks: this.state.completedTasks - 1 });
                return;
            }
            this.setState({ completedTasks: this.state.completedTasks + 1 });
        }
        else {
            this.setState({ completedTasks: this.state.completedTasks - 1 });
        }
    }

    moveTask = (dragIndex, hoverIndex) => {
        const { tasks } = this.state;
        const dragTask = tasks[dragIndex];

		this.setState(
			update(this.state, {
				tasks: {
					$splice: [[dragIndex, 1], [hoverIndex, 0, dragTask]],
				}
			})
        );
    }
    
    resetIndex = () => {
        var tasks = this.state.tasks;
        tasks.map((task, i) => {
            task.index = i;
            this.database.child(task.id).update({ index: i });
        });

        this.setState({ tasks: tasks });
    }

    render() {
        const { isDragging, connectDragSource, connectDropTarget } = this.props
        let viewDisplay = {};
        let editDisplay = {};

        if(this.state.editing) {
            viewDisplay.display = 'none';
        }
        else {
            editDisplay.display = 'none';
        }

        viewDisplay.opacity = isDragging ? 0 : 1;

        return (
            connectDragSource &&
            connectDropTarget &&
            connectDragSource(
                connectDropTarget(
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
                                <Task task={task} done={task.done} key={task.id} moveTask={this.moveTask} editTask={(task) => this.editTask(task)} toggleCompleted={(id, value) => this.toggleCompleted(id, value)}
                                    delete={(id) => this.deleteTask(id)} 
                                    resetIndex={this.resetIndex}/>
                            ))}
                        </ul>
                    </div>
                ),
            )
        );
    }
}
export default flow(
    DragSource('todolist',
	    listSource,
	    (connect, monitor) => ({
		    connectDragSource: connect.dragSource(),
		    isDragging: monitor.isDragging(),
        }),),
     DropTarget('todolist', listTarget, (connect) => ({
        connectDropTarget: connect.dropTarget(),
    })))
    (TodoList);