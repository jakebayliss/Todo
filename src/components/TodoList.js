import React from 'react';
import Task from './Task';

class TodoList extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            text: '',
            tasks: []
        }
    }

    taskOnChange = (e) => {
        if(e.key === 'Enter'){
            this.addTask();
        }
        this.setState({text: e.target.value});
    }

    addTask = () => {
        if(this.state.text){
            let newTask = {
                text: this.state.text,
                key: Date.now()
            };
            this.setState({
                items: [...this.state.items, newTask],
                text: ''
            });
        }
    }

    render() {
        console.log(this.props.title);
        let tasks = this.props.tasks.map(task => <Task text={task.text} key={task.key} />);

        return (
            <div className="list">
                <h4>{this.props.title}</h4>
                <input type="text" placeholder="What ya needa do" value={this.state.text} onChange={this.taskOnChange} />
                <button onClick={this.addTask}>+</button>
                <ul>
                    {tasks}
                </ul>
            </div>
        );
    }
}

export default TodoList;