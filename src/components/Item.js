import React, { useState, useEffect } from 'react';
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

const Item = ({item, moveItem, editItem, toggleCompleted, deleteItem, connectDragSource, connectDropTarget, isDragging}) => {

    const [previousValue, setPreviousValue] = useState('');
    const [isModalOpen, setIsModelOpen] = useState(false);

    const handleClick = (e) => {
        if(e.target.tagName === 'INPUT') {
            toggleCompleted(item.id, !item.done);
            return;
        }
        setIsModelOpen(true);
    }

    const saveChanges = (newText, notes) => {
        editItem(item.id, newText, notes);
        setIsModelOpen(false);
    }

    const display = () => {
        let opacity = isDragging ? 0 : 1;
        return {opacity};
    }

    return (
        connectDragSource &&
        connectDropTarget &&
        connectDragSource(
            connectDropTarget(
                <div className="item-container">
                    <li className={item.done ? "item done" : "item"} /*style={() => display()}*/ onClick={(e) => handleClick(e)} >
                        <div className="item-inner">
                            <input className="item-checkbox" checked={item.done} type="checkbox" onChange={(e) => console.log(e)}/>
                            {item.text}
                        </div>
                    </li>
                    {isModalOpen && (
                        <ItemModal text={item.text} notes={item.notes} deleteItem={() => deleteItem(item.id)} isOpen={isModalOpen} save={(newText, notes) => saveChanges(newText, notes)}
                            cancel={() => setIsModelOpen(false)} />
                    )}
                </div>
            ),
        )
    );
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