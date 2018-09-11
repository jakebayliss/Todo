import React from 'react';

class Task extends React.Component {
    constructor(props) {
        super(props);
    }

    render(){
        return(
            <li key={this.props.task.key} className="task" >{this.props.task.text}</li>
        );
    }
}

export default Task;