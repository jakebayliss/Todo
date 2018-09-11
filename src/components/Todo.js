import React from 'react';
import TodoList from './TodoList';
import '../styles/app.css';
 
class Todo extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            title: '',
            lists: [],
            task: '',
            items: []
        };
    }

    listOnChange = (e) => {
        if(e.key === 'Enter'){
            this.createList();
            return;
        }
        this.setState({title: e.target.value});
    }

    createList = () => {
        if(this.state.title){
            let newList = {
                title: this.state.title,
                key: Date.now(),
                tasks: []
            };

            this.setState({
                lists: [...this.state.lists, newList],
                title: ''
            });
        }
    }

    render(){
        let lists = this.state.lists.map(list => <TodoList title={list.title} tasks={list.tasks} key={list.key} />);

        return (
            <div className="container">
                <h1>Yeet.</h1>
                <div className="create-list">
                    <input autoFocus type="text" placeholder="Create a new list" value={this.state.title} onChange={this.listOnChange} onKeyPress={this.listOnChange} />
                    <button onClick={this.createList}>+</button>
                </div>
                {lists}
            </div>
        );
    }
}

export default Todo;