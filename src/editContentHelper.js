import React from 'react';

function editContentHelper(WrappedComponent) {
  return class extends React.Component {

    state = {
      editing: false
    }

    toggleEdit = (e) => {
      e.stopPropagation();
      if (this.state.editing) {
        this.setState({ editing: false });
        return;
      }
      this.setState({ editing: true }, () => {
        this.domElm.focus();
      });
    };

    save = () => {
      this.setState({ editing: false }, () => {
        if (this.isValueChanged()) {
          console.log('Value is changed', this.domElm.textContent);
          return;
        }
        this.domElm.textContent = this.props.value;
        this.setState({ editing: false });
      });
    };

    isValueChanged = () => {
      console.log(this.domElm.textContent);
      if(this.props.value !== this.domElm.textContent && this.domElm.textContent !== "") {
        console.log('true');
        return true;
      }
      console.log('false');
      return false;
    };

    handleKeyDown = (e) => {
      if(e.key === 'Enter'){
        this.save();
      }
    };

    render() {
      let editOnClick = true;
      const {editing} = this.state;
      if (this.props.editOnClick !== undefined) {
        editOnClick = this.props.editOnClick;
      }
      return (
        <WrappedComponent
          className={editing ? 'editing' : ''}
          onDoubleClick={editOnClick ? this.toggleEdit : undefined}
          contentEditable={editing}
          ref={(domNode) => {
            this.domElm = domNode;
          }}
          onBlur={this.save}
          onKeyDown={this.handleKeyDown}
          {...this.props}
          value={this.props.value}
      >
        {this.props.value}
      </WrappedComponent>
      )
    }
  }
}

export default editContentHelper;