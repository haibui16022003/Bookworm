import React from 'react';

const SignUpPage = () => {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <form style={{ display: 'flex', flexDirection: 'column', width: '300px' }}>
                <h2>Sign Up</h2>
                <label htmlFor="username">Username</label>
                <input type="text" id="username" name="username" placeholder="Enter your username" />
                
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" placeholder="Enter your email" />
                
                <label htmlFor="password">Password</label>
                <input type="password" id="password" name="password" placeholder="Enter your password" />
                
                <button type="submit" style={{ marginTop: '20px' }}>Sign Up</button>
            </form>
        </div>
    );
};

export default SignUpPage;