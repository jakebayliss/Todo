import React from 'react';
import firebase from './config/firebase';
import "firebase/auth";
import "firebase/firestore";

class Signup extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            name: "",
            email: "",
            password: "",
            confirmPassword: ""
        }

        this.db = firebase.firestore();
        this.users = this.db.collection('users');
    }

    signUp = () => {
        if(this.state.password !== this.state.confirmPassword) {
            console.log('The passwords do not match');
            return;
        }
        let self = this;
        firebase.auth().fetchSignInMethodsForEmail(this.state.email)
            .then(provider => {
                if(provider.length === 0){
                    firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password)
                        .then((user) => {
                            localStorage.setItem('user', JSON.stringify(user));
                            self.users.doc(user.user.uid).set({
                                displayName: self.state.name,
                                email: self.state.email
                            });
                            user.user.updateProfile({
                                displayName: this.state.name
                            });
                        });
                }
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

    handleConfirmPasswordChange = (e) => {
        this.setState({ confirmPassword: e.target.value });
    }

    render() {
        return (
            <div className="form-container">
                <input className="input" type="text" placeholder="Display Name" value={this.state.name} onChange={this.handleNameChange} />
                <input className="input" type="text" placeholder="Email" value={this.state.email} onChange={this.handleEmailChange} />
                <input className="input" type="password" placeholder="Password" value={this.state.password} onChange={this.handlePasswordChange} />
                <input className="input" type="password" placeholder="Confirm Password" value={this.state.confirmPassword} onChange={this.handleConfirmPasswordChange} />
                <button className="submit" onClick={this.signUp}>Sign up</button>
            </div>
        )
    }
}

export default Signup;