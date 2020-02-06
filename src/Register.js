import React, { useState } from 'react';
import Firebase from './config/firebase';

const Register = (props) => {

    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const onRegister = async () => {
        try {
            await Firebase.register(username, email, password);
            props.history.push("/");
        } catch(error) {
            alert(error.message);
        }
    }

    return (
        <form onSubmit={e => e.preventDefault() && false}>
            <label>Username:</label>
            <input type="text" id="username" name="username" value={username} onChange={e => setUsername(e.target.value)} />
            <label>Name:</label>
            <input type="text" id="name" name="name" value={name} onChange={e => setName(e.target.value)} />
            <label>Email:</label>
            <input type="text" id="email" name="email" value={email} onChange={e => setEmail(e.target.value)} />

            <label>Password:</label>
            <input type="password" id="password" name="password" value={password} onChange={e => setPassword(e.target.value)} />

            <button onClick={onRegister}>Submit</button>
        </form>
    )
}

export default Register;