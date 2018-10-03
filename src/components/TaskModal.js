import React from 'react';

class TaskModal extends React.Component {
    constructor(props) {
        super (props);

        this.state = {
            title: '',
            notes: ''
        };
    }

    componentDidMount = () => {
        this.setState({ title: this.props.title, notes: this.props.notes });
        document.getElementById('title-edit').focus();
        document.body.addEventListener('keydown', (e) => {
            this.handleEnterEsc(e);
        })
    }

    save = () => {
        if(this.state.title) {
            this.props.save(this.state.title);
        }
    }

    handleEnterEsc = (e) => {
        if(e.key === 'Enter' && (document.activeElement != document.getElementById('notes'))) {
            if(this.state.title) {
                this.props.save(this.state.title, this.state.notes);
            }
        }
        else if(e.key === 'Escape') {
            this.props.cancel();
        }
    }

    handleTaskChange = (e) => {
        this.setState({ title: e.target.value });
    }

    handleNotesChange = (e) => {
        this.setState({ notes: e.target.value });
    }

    render() {
        let style = {};
        style.display = this.props.isOpen ? 'flex' : 'none';

        return (
            <div id="overlay" className="modal-overlay" style={style}>
                <div id={this.props.title + " modal"} className="modal" style={style} onKeyDown={this.handleEnterEsc}>
                    <div className="modal-content">
                        <input id="title-edit" className="modal-title" type="text" value={this.state.title} onChange={this.handleTaskChange} onKeyDown={this.handleEnterEsc} />
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

export default TaskModal;