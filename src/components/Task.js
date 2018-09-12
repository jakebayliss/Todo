import React from 'react';

class Task extends React.Component {
    constructor(props) {
        super(props);
    }

    render(){
        return(
            <li key={this.props.key} className="task" >{this.props.text}</li>
        );
    }
}

export default Task;