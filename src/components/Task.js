import React from 'react';

class Task extends React.Component {
    constructor(props) {
        super(props);
        console.log(props);
    }

    createItem = (item) => {
        return <li key={item.key}>{item.text}</li>
    }

    render(){
        let items = this.props.items.map(item => this.createItem(item));

        return(
            <ul>
                {items}
            </ul>
        );
    }
}

export default Task;