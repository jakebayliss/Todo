import React from 'react';
import firebase from './config/firebase';

class Login extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            email: "",
            password: ""
        }
    }

    login = () => {
        firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.email)
            .catch(function(error) {
                var errorCode = error.code;
                var errorMessage = error.message;
            });
    }

    handleEmailChange = (e) => {
        this.setState({ email: e.target.value });
    }
    
    handlePasswordChange = (e) => {
        this.setState({ password: e.target.value });
    }

    render() {
        return (
            <div className="form-container">
                <input className="login-input" type="text" placeholder="Email" value={this.state.email} onChange={this.handleEmailChange} />
                <input className="login-input password" type="password" placeholder="Password" value={this.state.password} onChange={this.handlePasswordChange} />
                <button className="submit" onClick={this.login}>Login</button>
            </div>
        )
    }
}

export default Login;