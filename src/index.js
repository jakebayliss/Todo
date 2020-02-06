import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

import Todo from './components/Todo';
import Login from './Login';
import Register from './Register';

import Firebase from './config/firebase';

import './styles/app.css';

export default function App() {

    const [user, setUser] = useState({});
    const [activeElement, setActiveElement] = useState();
    const elements = {
        Login: 1,
        Signup: 2
    };
    const [clicked, setClicked] = useState(false);

    useEffect(() => {
        Firebase.auth.onAuthStateChanged(user => {
            setUser(user);
            console.log(user);
        });
    });

    login = () => {
        if(activeElement === elements.Login) {
            setActiveElement(null);
            document.getElementById('login-button').style.backgroundColor = '#404040';
        } 
        setActiveElement(elements.Login);
        document.getElementById('signup-button').style.backgroundColor = '#404040';
        document.getElementById('login-button').style.backgroundColor = 'rgb(20, 20, 20)';
        return <Login />;
    }

    register = () => {
        if(activeElement === elements.Signup) {
            setActiveElement(null);
            document.getElementById('signup-button').style.backgroundColor = '#404040';
        } 
        setActiveElement(elements.Signup);
        document.getElementById('login-button').style.backgroundColor = '#404040';
        document.getElementById('signup-button').style.backgroundColor = 'rgb(20, 20, 20)';
        return <Signup />;
    }

    logout = () => {
        Firebase.auth().signOut();
        setUser({});
    }

    return (
        <div className="container">
            <div>
                <h1><span id="mindex-cap">M</span>index</h1>
            </div>
            {user && (
                <div className="logout-container">
                    <p>{ user.email } </p>
                    <p onClick={this.logout}>Logout</p>
                </div>
            )}
            {user && (
                <p className="greeting">Hey { user.displayName }</p>
            )}
            {user ? 
                <Todo user={user} uid={user.uid} /> : 
                <Router>
                    <div>
                        <div className="login-page-container">
                            <Link to="/login" id="login-button" className="login-button" onClick={this.login}>Login</Link>
                            <Link to="/register" id="signup-button" className="signup-button" onClick={this.register}>Sign Up</Link>
                        </div>
                        <Route path="/login" component={Login} />
                        <Route path="/register" component={Register} />
                    </div>
                </Router>
            }
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById('app'));