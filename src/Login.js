import React, { useState } from 'react';
import Firebase from './config/firebase';

const Login = (props) => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const onLogin = async () => {
        try {
            await Firebase.login(email, password);
            props.history.push("/");
        } catch(error) {
            alert(error.message);
        }
    }

    return (
        <form onSubmit={e => e.preventDefault() && false}>
            <label>Email:</label>
            <input type="text" id="email" name="email" value={email} onChange={e => setEmail(e.target.value)} />
            <label>Password:</label>
            <input type="password" id="password" name="password" value={password} onChange={e => setPassword(e.target.value)} />

            <button onClick={onLogin}>Submit</button>
        </form>
    )
}

export default Login;