import React, { useState, useEffect } from 'react';
import Item from './Item';
import { findDOMNode } from 'react-dom';
import { DragSource, DropTarget } from 'react-dnd';
import flow from 'lodash.flow';
import '../styles/list.css';
import update from 'immutability-helper';
import Firebase from '../config/firebase';

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

// TODO: Handle sideways drag
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

const List = ({list, editList, deleteList, moveList, presetIndex, connectDragSource, connectDropTarget, isDragging}) => {

    const [listTitle, setListTitle] = useState(list.title);
    const [text, setText] = useState('');
    const [previousValue, setPreviousValue] = useState();
    const [editing, setEditing] = useState(false);
    const [items, setItems] = useState([]);
    const [completedItems, setCompletedItems] = useState(0);

    useEffect(() => {
        (async () => {
            setItems(await Firebase.getItems(list.id));
        })();
    }, []);

    useEffect(() => {
        console.log(`List ${list.id} items: ${items}`);
    }, [items]);

    const itemOnChange = (e) => {
        if(e.key === 'Enter'){
            addItem();
            return;
        }
        setText(e.target.value);
    }

    const addItem = async () => {
        if(text) {
            let item = {
                listId: list.id,
                text: text,
                notes: '',
                done: false,
                index: items.length,
                added: Date.now(),
                updated: null
            };

            const itemId = await Firebase.addItem(item);
            item.id = itemId;
            setItems([...items, item]);
            setText('');
        }
    }

    const handleEdit = () => {
        setEditing(true);
        setPreviousValue(listTitle);
    }

    const handleDone = (e) => {
        if(e.key === 'Enter'){
            if(!listTitle) {
                setTitle(previousValue);
            }
            editList(list.id, listTitle);
            setEditing(false);
        }
    }

    const deleteItem = async (id) => {
        await Firebase.deleteItem(id);
        setItems(items.filter(x => x.id != id));
    }

    const editItem = async (id, text, notes) => {
        let item = items.filter(x => x.id == id)[0];
        item.text = text;
        item.notes = notes;
        console.log('updated item', item)
        await Firebase.updateItem(item);
    }

    const toggleCompleted = async (id, value) => {
        let item = items.filter(x => x.id == id)[0];
        item.done = !item.done;
        await Firebase.updateItem(item);
        updateItemCounter(value, false);
    }

    const updateItemCounter = (done, deleted) => {
        if(!done && deleted) {
            return;
        }
        if(done) {
            if(deleted) {
                setCompletedItems(completedItems - 1);
                return;
            }
            setCompletedItems(completedItems + 1);
        }
        else {
            setCompletedItems(completedItems - 1);
        }
    }

    const moveItem = (dragIndex, hoverIndex) => {
        const dragItem = items[dragIndex];

		this.setState(
			update(this.state, {
				items: {
					$splice: [[dragIndex, 1], [hoverIndex, 0, dragItem]],
				}
			})
        );
    }
    
    const resetIndex = () => {
        var prevItems = items;
        prevItems.map((item, i) => {
            item.index = i;
            this.database.child(item.id).update({ index: i });
        });

        setItems(prevItems);
    };

    const titleDisplay = () => {
        let viewDisplay = {};
        let editDisplay = {};

        if(editing) {
            viewDisplay.display = 'none';
        }
        else {
            editDisplay.display = 'none';
        }

        viewDisplay.opacity = isDragging ? 0 : 1;
        return { viewDisplay, editDisplay }
    }

    return (
        connectDragSource &&
        connectDropTarget &&
        connectDragSource(
            connectDropTarget(
                <div className="list">
                    <div className="list-banner">
                        {items.length > 0 && (
                            <p className="counter">{completedItems}/{items.length}</p>
                        )}
                        <h2 className="list-title" value={list.title} onDoubleClick={() => handleEdit()} style={titleDisplay().viewDisplay}>{list.title}</h2>
                        <input className="list-title edit" value={listTitle} type="text" onKeyDown={e => handleDone(e)} 
                            onChange={e => setListTitle(e.target.value)} style={titleDisplay().editDisplay} />
                        <button className="remove-list-button" onClick={() => deleteList(list.id)}>&times;</button>
                    </div>
                    <div className="add-item">
                        <input type="text" id={list.title + "-text"} className="item-text" placeholder="Add an item" 
                            value={text} onChange={e => itemOnChange(e)} onKeyDown={e => itemOnChange(e)} />
                        <button className="item-button" onClick={() => addItem()}>&#43;</button>
                    </div>
                    <ul className ="items">
                        {items && items.length > 0 && (
                            items.map(item => (
                                <Item item={item} done={item.done} key={item.id} 
                                    moveItem={(dragIndex, hoverIndex) => moveItem(dragIndex, hoverIndex)} 
                                    editItem={(id, text, notes) => editItem(id, text, notes)} 
                                    toggleCompleted={(id, value) => toggleCompleted(id, value)} 
                                    deleteItem={(id) => deleteItem(id)} 
                                    resetIndex={() => resetIndex()}/>
                            ))
                        )}
                    </ul>
                </div>
            ),
        )
    );
}

export default flow(
    DragSource('list',
	    listSource,
	    (connect, monitor) => ({
		    connectDragSource: connect.dragSource(),
		    isDragging: monitor.isDragging(),
        }),),
     DropTarget('list', listTarget, (connect) => ({
        connectDropTarget: connect.dropTarget(),
    })))
    (List);