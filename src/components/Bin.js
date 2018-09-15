import React from 'react';
import { DropTarget } from 'react-dnd';

function collect(connect, monitor) {
    return {
      // Call this function inside render()
      // to let React DnD handle the drag events:
      connectDropTarget: connect.dropTarget(),
      // You can ask the monitor about the current drag state:
      hovered: monitor.isOver(),
      item: monitor.getItem()
    };
}

class Bin extends React.Component {
    render() {
        const { hovered, item, connectDropTarget } = this.props;
        let border = hovered ? 'white 2px solid' : 'rgb(50, 50, 50) 2px solid';
        return connectDropTarget(
            <div className="bin" style={{ border }}>
                <i className="fas fa-trash-alt"></i>
            </div>
        );
    }
}

export default DropTarget('task', {}, collect)(Bin);