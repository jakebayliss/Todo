import React from 'react';
import { findDOMNode } from 'react-dom'
import { DragSource, DropTarget } from 'react-dnd';
import flow from 'lodash.flow';
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

const taskTarget = {
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

        props.moveTask(dragIndex, hoverIndex);
        props.resetIndex();
	}
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
        console.log(this.props.task);
        this.setState({ title: this.props.task.text, editing: false });
    }

    completeTask = () => {
        if(this.state.done) {
            this.props.completeTask(this.props.task.key, true);
            this.setState({ done: false });
            return;
        }
        this.props.completeTask(this.props.task.key, false);
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
        this.setState({ title: e.target.value });
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
                    <div draggable={!this.state.editing && this.props.deleting} className="task-container">
                        <li className={this.state.done ? "task done" : "task"} style={viewDisplay} onDoubleClick={this.handleEdit}>
                            {this.state.title}
                            <input hidden={this.props.deleting} className="task-checkbox" checked={this.state.done} type="checkbox" onChange={this.completeTask} />
                            <button className="delete-task-button" hidden={!this.props.deleting} onClick={this.props.delete(this.props.task.key)}>&times;</button>
                        </li>
                        <input type="text" autoFocus id={this.state.title} className="task-title edit" style={editDisplay} value={this.state.title} 
                            onChange={this.handleTaskChange} onKeyDown={this.handleDone}/>
                    </div>
                ),
            )
        );
    }
}

export default flow(
    DragSource('task',
	    taskSource,
	    (connect, monitor) => ({
		    connectDragSource: connect.dragSource(),
		    isDragging: monitor.isDragging(),
        }),),
     DropTarget('task', taskTarget, (connect) => ({
        connectDropTarget: connect.dropTarget(),
    })))
    (Task);