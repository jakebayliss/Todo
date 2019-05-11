import React from 'react';
import Todo from './components/Todo';
import Login from './Login';
import Signup from './Signup';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import './styles/app.css';
import firebase from './config/firebase';
import "firebase/auth";
import 'firebase/database';
 
class App extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            user: {},
            activeElement: null,
            clicked: false,
            ActiveElement: {
                Login: 1,
                Signup: 2
            }
        };
    }

    componentDidMount = () => {
        firebase.auth().onAuthStateChanged((user) => {
            if(user) {
                localStorage.setItem('user', JSON.stringify(user));
                this.setState({ user: user });
            } else {
                this.setState({ user: null });
            }
        });
    }

    login = () => {
        if(this.state.activeElement === ActiveElement.Login) {
            this.state.activeElement = null;
            document.getElementById('login-button').style.backgroundColor = '#404040';
        } 
        this.activeElement = ActiveElement.Login;
        document.getElementById('signup-button').style.backgroundColor = '#404040';
        document.getElementById('login-button').style.backgroundColor = 'rgb(20, 20, 20)';
        return <Login />;
    }

    signup = () => {
        if(this.state.activeElement === ActiveElement.Signup) {
            this.state.activeElement = null;
            document.getElementById('signup-button').style.backgroundColor = '#404040';
        } 
        document.getElementById('login-button').style.backgroundColor = '#404040';
        document.getElementById('signup-button').style.backgroundColor = 'rgb(20, 20, 20)';
        return <Signup />;
    }

    logout = () => {
        firebase.auth().signOut();
        localStorage.setItem('user', null);
        this.setState({ user: null });
    }

    render(){
        return (
            <div className="container">
                <div>
                    <h1><span id="mindex-cap">M</span>index</h1>
                </div>
                {this.state.user && (
                    <div className="logout-container">
                        <p>{ this.state.user.email } </p>
                        <p onClick={this.logout}>Logout</p>
                    </div>
                )}
                {this.state.user && (
                    <p className="greeting">Hey { this.state.user.displayName }</p>
                )}
                {this.state.user ? 
                    <Todo user={this.state.user} uid={this.state.user.uid} /> : 
                    <Router>
                        <div>
                            <div className="login-page-container">
                                <Link to="/Login" id="login-button" className="login-button" onClick={this.login}>Login</Link>
                                <Link to="/Signup" id="signup-button" className="signup-button" onClick={this.signup}>Sign Up</Link>
                            </div>
                            <Route path="/login" component={Login} />
                            <Route path="/signup" component={Signup} />
                        </div>
                    </Router>
                }
            </div>
        );
    }
}

export default App;