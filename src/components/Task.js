import React from 'react';

class Task extends React.Component {
    constructor(props) {
        super(props);
    }

    render(){
        return(
            <li className="task">{this.props.text}</li>
        );
    }
}

export default Task;