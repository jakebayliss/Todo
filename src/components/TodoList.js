import React from 'react';
import Task from './Task';

class TodoList extends React.Component {
constructor(props){
    super(props);
}

    render() {
        return (
            <ul>
                {this.props.items.map((item, index) => {
                    //<Task key={index} task={item} />
                    <li key={index}>{item}</li>
                })}
            </ul>
        );
    }
}

export default TodoList;