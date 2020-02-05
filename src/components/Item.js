import React from 'react';
import { findDOMNode } from 'react-dom'
import { DragSource, DropTarget } from 'react-dnd';
import flow from 'lodash.flow';
import ItemModal from './ItemModal';
import '../styles/item.css';
import '../styles/modal.css';

const itemSource = {
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

const itemTarget = {
	hover(props, monitor, component) {
		if (!component) {
			return null
		}
        const dragIndex = monitor.getItem().index;
		const hoverIndex = props.item.index;

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

        props.moveitem(dragIndex, hoverIndex);
        props.resetIndex();
	}
}

class Item extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            item: props.item,
            previousValue: '',
            modalIsOpen: false
        };

        console.log(props.item);
    }

    handleClick = (e) => {
        if(e.target.tagName === 'INPUT') {
            this.toggleCompleted();
            return;
        }
        this.openModal();
    }
    
    toggleCompleted = () => {
        let item = this.state.item;
        this.props.toggleCompleted(this.state.item.id, this.state.item.done ? false : true);
        item.done = this.state.item.done ? false : true;
        this.setState({ item: item });
    }
    
    deleteItem = () => {
        this.props.delete(this.state.item.id);
        this.setState({ modalIsOpen: false });
    }
    
    openModal = (e) => {
        this.setState({ modalIsOpen: true });
    }

    placeholder = () => {
        return;
    }

    saveChanges = (newText, notes) => {
        let item = this.state.item;
        item.text = newText;
        item.notes = notes;
        this.props.editItem(item);
        this.setState({ modalIsOpen: false, item: item });
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
                    <div className="item-container">
                        <li className={this.state.item.done ? "item done" : "item"} style={{opacity}} onClick={this.handleClick} >
                            <div className="item-inner">
                                <input className="item-checkbox" checked={this.state.item.done} type="checkbox" onChange={this.placeholder}/>
                                {this.state.item.text}
                            </div>
                        </li>
                        {this.state.modalIsOpen && (
                            <ItemModal text={this.state.item.text} notes={this.state.item.notes} delete={this.deleteItem} isOpen={this.state.modalIsOpen} save={this.saveChanges}
                                cancel={this.cancel} />
                        )}
                    </div>
                ),
            )
        );
    }
}

export default flow(
    DragSource('item',
	    itemSource,
	    (connect, monitor) => ({
		    connectDragSource: connect.dragSource(),
		    isDragging: monitor.isDragging(),
        }),),
     DropTarget('item', itemTarget, (connect) => ({
        connectDropTarget: connect.dropTarget(),
    })))
    (Item);