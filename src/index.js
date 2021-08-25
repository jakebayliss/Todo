import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

import Todo from './components/Todo';
import Login from './Login';
import Register from './Register';

import Firebase from './config/firebase';

import './styles/app.css';

const App = () => {
    const [user, setUser] = useState(null);
    const [activeElement, setActiveElement] = useState(null);
    const elements = {
        Login: 1,
        Signup: 2
    };
    const [clicked, setClicked] = useState(false);

    useEffect(() => {
        const unsubscribe = Firebase.auth.onAuthStateChanged((user) => {
            if (user) {
                setUser(user); 
            }
            else setUser(null);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if(user) {
            console.log('user', user);
        }
    }, [user]);

    const login = () => {
        if(activeElement === elements.Login) {
            setActiveElement(null);
            document.getElementById('login-button').style.backgroundColor = '#404040';
        } 
        setActiveElement(elements.Login);
        document.getElementById('signup-button').style.backgroundColor = '#404040';
        document.getElementById('login-button').style.backgroundColor = 'rgb(20, 20, 20)';
        return <Login />;
    }

    const register = () => {
        if(activeElement === elements.Signup) {
            setActiveElement(null);
            document.getElementById('signup-button').style.backgroundColor = '#404040';
        } 
        setActiveElement(elements.Signup);
        document.getElementById('login-button').style.backgroundColor = '#404040';
        document.getElementById('signup-button').style.backgroundColor = 'rgb(20, 20, 20)';
        return <Signup />;
    }

    const logout = () => {
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
                    <p onClick={() => logout()}>Logout</p>
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
                            <Link to="/login" id="login-button" className="login-button" onClick={() => login()}>Login</Link>
                            <Link to="/register" id="signup-button" className="signup-button" onClick={() => register()}>Sign Up</Link>
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