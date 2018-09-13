import React from 'react';
import '../styles/task.css';

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
        return(
            <li className={this.state.done ? "task done" : "task"}>{this.props.text}<input className="task-checkbox" checked={this.state.done} type="checkbox" onChange={this.completeTask}/></li>
        );
    }
}

export default Task;