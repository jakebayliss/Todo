import React, { useState, useEffect, useRef } from 'react';
import List from './List';
import HTML5Backend from 'react-dnd-html5-backend'
import { DragDropContext } from 'react-dnd';
import '../styles/app.css';
import update from 'immutability-helper';
import Firebase from '../config/firebase';

const Todo = ({user, uid}) => {
    const [listTitle, setListTitle] = useState('');
    const [lists, setLists] = useState([]);

    useEffect(() => {
        (async () => {
            if(user) {
                setLists(await Firebase.getLists(uid));
            }
        })();
    }, [user]);

    useEffect(() => {
        if(lists) {
            console.log(`User ${user.id} lists: ${lists}`);
        }
    }, [lists]);
        
    const listTitleOnChange = (e) => {
        if(e.key === 'Enter'){
            createList();
            return;
        }
        setListTitle(e.target.value);
    }

    const createList = async () => {
        let list = {
            uid: user.uid,
            title: listTitle,
            added: Date.now()
        }

        const listId = await Firebase.createList(list);
        list.id = listId;
        setLists([...lists, list]);
        setListTitle('');
    }

    const deleteList = async (id) => {
        await Firebase.deleteList(id);
        setLists(lists.filter(x => x.id != id));
    }

    const editList = async (id, title) => {
        await Firebase.updateList(id, title);
    }

    const moveList = (dragIndex, hoverIndex) => {
        const dragList = lists[dragIndex]

		this.setState(
			update(this.state, {
				lists: {
					$splice: [[dragIndex, 1], [hoverIndex, 0, dragList]],
				},
			}),
        );
    }

    const resetIndex = () => {
        var prevLists = lists;
        prevLists.map((list, i) => {
            list.index = i;
        });
        setlists(prevLists);
    }

    return (
        <div className="container">
            <div className="create-list">
                <input autoFocus type="text" className="list-text" placeholder="What's on your mind" 
                    value={listTitle} onChange={e => listTitleOnChange(e)} onKeyPress={e => listTitleOnChange(e)} />
                <button className="list-button" onClick={() => createList()}>Create</button>
            </div>
            <div className="lists">
                {lists && lists.length > 0 && (
                    lists.map(list => (
                        <List list={list} key={list.id} editList={(id, title) => editList(id, title)}
                            deleteList={(id) => deleteList(id)} moveList={(dragIndex, hoverIndex) => moveList(dragIndex, hoverIndex)} resetIndex={() => resetIndex()} />
                    ))
                )}
            </div>
        </div>
    );
}

export default DragDropContext(HTML5Backend)(Todo);