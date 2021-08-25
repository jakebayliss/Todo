import React, { useState } from 'react';

const ItemModal = ({text, notes, isOpen, save, cancel, deleteItem}) => {
    const [newText, setNewText] = useState(text);
    const [newNotes, setNewNotes] = useState(notes);


    const saveChanges = () => {
        if(newText || newNotes) {
            save(newText, newNotes);
            setNewText('');
            setNewNotes('');
        }
    }

    const handleEnterEsc = (e) => {
        if(e.key === 'Enter' && (document.activeElement != document.getElementById('notes'))) {
            if(newText || newNotes) {
                save(this.state.text, this.state.notes);
            }
        }
        else if(e.key === 'Escape') {
            cancel();
        }
    }

    const display = () => {
        let style = {};
        style.display = isOpen ? 'flex' : 'none';
        return { style };
    }

    return (
        <div id="overlay" className="modal-overlay" style={display().style}>
            <div id={text + " modal"} className="modal" style={display().style} onKeyDown={(e) => handleEnterEsc(e)}>
                <div className="modal-content">
                    <input id="title-edit" className="modal-title" type="text" value={newText} onChange={(e) => setNewText(e.target.value)} onKeyDown={(e) => handleEnterEsc(e)} />
                    <label className="notes-label">Notes</label>
                    <textarea id="notes" className="modal-notes" onChange={(e) => setNewNotes(e.target.value)} value={newNotes}></textarea>
                </div>
                <div className="modal-buttons">
                    <button className="modal-save" onClick={() => saveChanges()}>Save</button>
                    <button className="modal-cancel" onClick={() => cancel()}>Cancel</button>
                    <button className="modal-delete" onClick={() => deleteItem()}>Delete</button>
                </div>
            </div>
        </div>
    );
}

export default ItemModal;