import React from 'react';
import { findDOMNode } from 'react-dom'
import { DragSource, DropTarget } from 'react-dnd';
import flow from 'lodash.flow';
import TaskModal from './TaskModal';
import '../styles/task.css';
import '../styles/modal.css';

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
    }
}

const taskTarget = {
	hover(props, monitor, component) {
		if (!component) {
			return null
		}
        const dragIndex = monitor.getItem().index;
		const hoverIndex = props.task.index;

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
            task: props.task,
            previousValue: '',
            modalIsOpen: false
        };
    }

    toggleCompleted = () => {
        let task = this.state.task;
        this.props.toggleCompleted(this.state.task.id, this.state.task.done ? false : true);
        task.done = this.state.task.done ? false : true;
        this.setState({ task: task });
    }

    deleteTask = () => {
        this.props.delete(this.state.task.id);
        this.setState({ modalIsOpen: false });
    }

    openModal = () => {
        this.setState({ modalIsOpen: true });
    }

    saveChanges = (newText, notes) => {
        let task = this.state.task;
        task.text = newText;
        task.notes = notes;
        this.props.editTask(task);
        this.setState({ modalIsOpen: false, task: task });
    }

    cancel = () => {
        this.setState({ modalIsOpen: false });
    }

    render(){
        const { isDragging, connectDragSource, connectDropTarget } = this.props

        let opacity = isDragging ? 0 : 1;

        return (
            connectDragSource &&
            connectDropTarget &&
            connectDragSource(
                connectDropTarget(
                    <div className="task-container">
                        <li className={this.state.task.done ? "task done" : "task"} style={{opacity}} onDoubleClick={this.openModal}>
                            <div className="task-inner">
                                <input className="task-checkbox" checked={this.state.task.done} type="checkbox" onChange={this.toggleCompleted} />
                                {this.state.task.text}
                            </div>
                            <button className="edit-task-button" onClick={this.openModal} hidden={this.state.task.done}>&#9998;</button>
                            <button className="delete-task-button" hidden={!this.state.task.done} onClick={this.deleteTask}>&times;</button>
                        </li>
                        {this.state.modalIsOpen && (
                            <TaskModal text={this.state.task.text} notes={this.state.task.notes} delete={this.deleteTask} isOpen={this.state.modalIsOpen} save={this.saveChanges}
                                cancel={this.cancel} />
                        )}
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