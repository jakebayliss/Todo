import React from 'react';
import Item from './Item';
import { findDOMNode } from 'react-dom';
import { DragSource, DropTarget } from 'react-dnd';
import flow from 'lodash.flow';
import '../styles/list.css';
import update from 'immutability-helper';
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/firestore';

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

class List extends React.Component {
    constructor(props){
        super(props);
        this.unsubscribe = null;
        //this.database = firebase.database().ref().child(`users/${props.uid}/lists/${this.props.list.id}`);

        this.state = {
            text: '',
            title: '',
            previousValue: '',
            editing: false,
            items: [],
            completedItems: 0
        }

        console.log(this.props.title, this.props.id);

        this.db = firebase.firestore();
        this.ref = this.db.collection('items');
    }

    /*componentWillMount = () => {
        const previousItems = this.state.items;
        
        this.database.orderByChild('index').on('child_added', snap => {
            if(snap.val().text) {
                previousItems.push({
                    id: snap.key,
                    text: snap.val().text,
                    notes: snap.val().notes,
                    done: snap.val().done,
                    index: snap.val().index,
                    added: snap.val().added,
                    updated: null
                });
                this.setState({ items: previousItems });
            }
        });

        this.database.orderByChild('index').on('child_changed', snap => {
            const index = previousItems.findIndex(item => item.id === snap.key);
            if(snap.val().text) {
                previousItems[index].text = snap.val().text;
                previousItems[index].notes = snap.val().notes;
                previousItems[index].updated = snap.val().updated;
            }
            else if (snap.val().done) {
                previousItems[index].done = snap.val().done;
            }
            else if (snap.val().index) {
                previousItems[index].index = snap.val().index;
            }
            this.setState({ items: previousItems });
        });

        this.database.on('child_removed', snap => {
            const index = previousItems.findIndex(item => item.id === snap.key);
            if(index) {
                this.updateItemCounter(previousItems[index].done, true);
                previousItems.splice(index, 1);
            }
            this.setState({ items: previousItems });
        });
    }*/

    componentDidMount = () => {
        this.unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate);
        document.getElementById(this.props.title + "-text").focus();
        this.setState({ title: this.props.title, previousValue: this.props.title });
    }

    componentWillUnmount = () => {
        this.unsubscribe();
    }

    onCollectionUpdate = () => {
        const items = [];

        this.ref.where('listId', '==', this.props.id).get()
            .then(function(querySnapshot) {
                querySnapshot.forEach((doc) => {
                    items.push({
                        id: doc.data().id,
                        text: doc.data().text,
                        notes: doc.data().notes,
                        done: doc.data().done,
                        index: doc.data().index,
                        added: doc.data().added,
                        updated: doc.data().updated
                    });
                });
            })
            .then(
                this.setState({ 
                    items,
                    loading: false,
                })
            );
    }

    itemOnChange = (e) => {
        if(e.key === 'Enter'){
            this.additem();
            return;
        }
        this.setState({ text: e.target.value });
    }

    addItem = () => {
        if(this.state.text) {
            let item = {
                listId: this.props.id,
                id: this.ref.doc().id,
                text: this.state.text,
                notes: '',
                done: false,
                index: this.state.items.length,
                added: Date.now(),
                updated: null
            };

            this.ref.add(item)
                .then(function() {
                    const prevItems = this.state.items;
                    prevItems.push(item);
                    this.setState({ text: '' });
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
            this.props.editList(this.props.id, this.state.title);
            this.setState({ editing: false });
        }
    }

    handleTitleChange = (e) => {
        this.setState({ title: e.target.value });
    }

    deleteItem = (id) => {
        this.database.child(id).remove();
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
                this.setState({ completedItems: this.state.completedItems - 1 });
                return;
            }
            this.setState({ completedItems: this.state.completedItems + 1 });
        }
        else {
            this.setState({ completedItems: this.state.completedItems - 1 });
        }
    }

    moveItem = (dragIndex, hoverIndex) => {
        const { items } = this.state;
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
        var items = this.state.items;
        items.map((item, i) => {
            item.index = i;
            this.database.child(item.id).update({ index: i });
        });

        this.setState({ items: items });
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
                            {this.state.items.length > 0 && (
                                <p className="counter">{this.state.completedItems}/{this.state.items.length}</p>
                            )}
                            <h2 className="list-title" value={this.state.title} onDoubleClick={this.handleEdit} style={viewDisplay}>{this.state.title}</h2>
                            <input className="list-title edit" value={this.state.title} type="text" onKeyDown={this.handleDone} 
                                onChange={this.handleTitleChange} style={editDisplay} />
                            <button className="remove-list-button" onClick={this.props.deleteList}>&times;</button>
                        </div>
                        <div className="add-item">
                            <input type="text" id={this.props.title + "-text"} className="item-text" placeholder="Add an item" 
                                value={this.state.text} onChange={this.itemOnChange} onKeyDown={this.itemOnChange} />
                            <button className="item-button" onClick={this.addItem}>&#43;</button>
                        </div>
                        <ul className ="items">
                            {this.state.items.map(item => (
                                <Item item={item} done={item.done} key={item.id} moveItem={this.moveItem} editItem={(item) => this.editItem(item)} toggleCompleted={(id, value) => this.toggleCompleted(id, value)}
                                    delete={(id) => this.deleteItem(id)} 
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