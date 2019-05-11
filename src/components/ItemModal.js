import React from 'react';

class ItemModal extends React.Component {
    constructor(props) {
        super (props);

        this.state = {
            text: props.text,
            notes: props.notes
        };
    }

    componentDidMount = () => {
        document.getElementById('title-edit').focus();
        document.body.addEventListener('keydown', (e) => {
            this.handleEnterEsc(e);
        })
    }

    save = () => {
        if(this.state.text) {
            this.props.save(this.state.text, this.state.notes);
        }
    }

    handleEnterEsc = (e) => {
        if(e.key === 'Enter' && (document.activeElement != document.getElementById('notes'))) {
            if(this.state.text) {
                this.props.save(this.state.text, this.state.notes);
            }
        }
        else if(e.key === 'Escape') {
            this.props.cancel();
        }
    }

    handleItemChange = (e) => {
        this.setState({ text: e.target.value });
    }

    handleNotesChange = (e) => {
        this.setState({ notes: e.target.value });
    }

    render() {
        let style = {};
        style.display = this.props.isOpen ? 'flex' : 'none';

        return (
            <div id="overlay" className="modal-overlay" style={style}>
                <div id={this.props.text + " modal"} className="modal" style={style} onKeyDown={this.handleEnterEsc}>
                    <div className="modal-content">
                        <input id="title-edit" className="modal-title" type="text" value={this.state.text} onChange={this.handleItemChange} onKeyDown={this.handleEnterEsc} />
                        <label className="notes-label">Notes</label>
                        <textarea id="notes" className="modal-notes" onChange={this.handleNotesChange} value={this.state.notes}></textarea>
                    </div>
                    <div className="modal-buttons">
                        <button className="modal-save" onClick={this.save}>Save</button>
                        <button className="modal-cancel" onClick={this.props.cancel}>Cancel</button>
                        <button className="modal-delete" onClick={this.props.delete}>Delete</button>
                    </div>
                </div>
            </div>
        );
    }
}

export default ItemModal;