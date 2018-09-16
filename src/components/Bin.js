import React from 'react';
import { DropTarget } from 'react-dnd';

function collect(connect, monitor) {
    return {
      connectDropTarget: connect.dropTarget(),
      hovered: monitor.isOver(),
      item: monitor.getItem()
    };
}

class Bin extends React.Component {
    render() {
        const { hovered, item, connectDropTarget } = this.props;
        let border = hovered || this.props.value ? 'white 2px solid' : 'rgb(50, 50, 50) 2px solid';
        return connectDropTarget(
            <div className="bin" style={{ border }} onClick={this.props.deleting}>
                <i className="fas fa-trash-alt"></i>
            </div>
        );
    }
}

export default DropTarget('task', {}, collect)(Bin);