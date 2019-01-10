import React from 'react';
import firebase from './config/firebase';
import "firebase/auth";
import 'firebase/database';

class Signup extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            name: "",
            email: "",
            password: ""
        }

        this.database = firebase.database().ref().child(`users`);
    }

    signUp = () => {
        firebase.auth().fetchSignInMethodsForEmail(this.state.email)
            .then(provider => {
                if(provider.length === 0){
                    firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password)
                        .then((user) => {
                            console.log(user)
                            user.user.updateProfile({
                                displayName: this.state.name
                            });
                        });
                }
                console.log('There is already an account registered to this email address');
            })
            .catch(function(error) {
                var errorCode = error.code;
                var errorMessage = error.message;
                console.log(errorMessage);
            });
    }

    handleNameChange = (e) => {
        this.setState({ name: e.target.value });
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
                <input className="input" type="text" placeholder="Display Name" value={this.state.name} onChange={this.handleNameChange} />
                <input className="input" type="text" placeholder="Email" value={this.state.email} onChange={this.handleEmailChange} />
                <input className="input" type="password" placeholder="Password" value={this.state.password} onChange={this.handlePasswordChange} />
                <button className="submit" onClick={this.signUp}>Sign up</button>
            </div>
        )
    }
}

export default Signup;