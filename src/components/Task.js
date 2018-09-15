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
        // When dropped on a compatible target, do something.
        // Read the original dragged item from getItem():
        const item = monitor.getItem();

        // You may also read the drop result from the drop target
        // that handled the drop, if it returned an object from
        // its drop() method.
        const dropResult = monitor.getDropResult();

        // This is a good place to call some Flux action
        CardActions.moveCardToList(item.id, dropResult.listId);
    }
}

function collect(connect, monitor) {
    return {
      // Call this function inside render()
      // to let React DnD handle the drag events:
      connectDragSource: connect.dragSource(),
      connectDragPreview: connect.dragPreview(),
      // You can ask the monitor about the current drag state:
      isDragging: monitor.isDragging()
    };
  }

class Task extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            done: false
        }
    }

    completeTask = () => {
        if(this.state.done) {
            this.setState({ done: false });
            return;
        }
        this.setState({ done: true });
    }

    render(){
        const { isDragging, connectDragSource } = this.props;
        const opacity = isDragging ? 0 : 1;
        return connectDragSource(
            <li className={this.state.done ? "task done" : "task"} style={{ opacity }}>{this.props.task.text}<input className="task-checkbox" checked={this.state.done} type="checkbox" onChange={this.completeTask}/></li>
        );
    }
}

export default DragSource('task', taskSource, collect)(Task);