import React from 'react';
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

const List = () => {

    const [list, setList] = useState(props.list);
    const [text, setText] = useState('');
    const [previousValue, setPreviousValue] = useState();
    const [editing, setEditing] = useState(false);
    const [items, setItems] = useState([]);
    const [completedItems, setCompletedItems] = useState(0);

    useState(() => {
        Firebase.getItems(list.id).then(items => {
            setItems(items);
        });
    })

    itemOnChange = (e) => {
        if(e.key === 'Enter'){
            this.addItem();
            return;
        }
        setText(e.target.value);
    }

    addItem = () => {
        if(text) {
            let item = {
                listId: list.id,
                id: this.ref.doc().id,
                text: text,
                notes: '',
                done: false,
                index: items.length,
                added: Date.now(),
                updated: null
            };
            
            this.ref.add(item)
                .then(function() {
                    const prevItems = items;
                    prevItems.push(item);
                    setText('');
                });
        }
    }

    handleEdit = () => {
        setEditing(true);
        setPreviousValue(title);
    }

    handleDone = (e) => {
        if(e.key === 'Enter'){
            if(!title) {
                setTitle(previousValue);
            }
            props.editList(listid, title);
            setEditing(false);
        }
    }

    deleteItem = (id) => {
        let prevItems = this.state.items;
        this.ref.doc(id).delete();
        const index = prevItems.findIndex(item => item.id === id);
        if(index) {
            prevItems.splice(index, 1);
        }
        this.setState({ items: prevItems });
    }

    editItem = (item) => {
        this.database.child(item.id).update({ text: item.text, notes: item.notes, updated: Date.now() });
    }

    toggleCompleted = (id, value) => {
        this.database.child(id).update({ done: value });
        this.updateItemCounter(value, false);
    }

    updateItemCounter = (done, deleted) => {
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

    moveItem = (dragIndex, hoverIndex) => {
        const dragItem = items[dragIndex];

		this.setState(
			update(this.state, {
				items: {
					$splice: [[dragIndex, 1], [hoverIndex, 0, dragItem]],
				}
			})
        );
    }
    
    resetIndex = () => {
        var prevItems = items;
        prevItems.map((item, i) => {
            item.index = i;
            this.database.child(item.id).update({ index: i });
        });

        setItems(prevItems);
    };

    updatestuff = () => {
        const { isDragging, connectDragSource, connectDropTarget } = props;
        let viewDisplay = {};
        let editDisplay = {};

        if(this.state.editing) {
            viewDisplay.display = 'none';
        }
        else {
            editDisplay.display = 'none';
        }

        viewDisplay.opacity = isDragging ? 0 : 1;
    }

    return (
        connectDragSource &&
        connectDropTarget &&
        connectDragSource(
            connectDropTarget(
                <div className="list">
                    <div className="list-banner">
                        {this.state.items.length > 0 && (
                            <p className="counter">{this.state.completedItems}/{this.state.items.length}</p>
                        )}
                        <h2 className="list-title" value={this.state.title} onDoubleClick={this.handleEdit} style={viewDisplay}>{this.state.title}</h2>
                        <input className="list-title edit" value={this.state.title} type="text" onKeyDown={this.handleDone} 
                            onChange={e => setTitle(e.target.value)} style={editDisplay} />
                        <button className="remove-list-button" onClick={this.props.deleteList}>&times;</button>
                    </div>
                    <div className="add-item">
                        <input type="text" id={this.props.title + "-text"} className="item-text" placeholder="Add an item" 
                            value={this.state.text} onChange={this.itemOnChange} onKeyDown={this.itemOnChange} />
                        <button className="item-button" onClick={this.addItem}>&#43;</button>
                    </div>
                    <ul className ="items">
                        {this.state.items.map(item => (
                            <Item item={item} done={item.done} key={item.index} moveItem={this.moveItem} editItem={(item) => this.editItem(item)} toggleCompleted={(id, value) => this.toggleCompleted(id, value)}
                                delete={(id) => this.deleteItem(id)} 
                                resetIndex={this.resetIndex}/>
                        ))}
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