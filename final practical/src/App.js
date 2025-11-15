import React, { useState } from "react";

function CounterApp() {
  const [count, setCount] = useState(0);

  const handleIncrement = () => {
    setCount(count + 1);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>
      <h1>Count: {count}</h1>
      <button onClick={handleIncrement}>Increment</button>
    </div>
  );
}

export default CounterApp;


/*import React from 'react';

const UserProfile = ({ username }) => {
  return (
    <div style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
      <h3>User Profile</h3>
      <p><strong>Username:</strong> {username}</p>
    </div>
  );
};

const Icon = ({ username }) => {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <UserProfile username={username} />
    </div>
  );
};

const Header = ({ username }) => {
  return (
    <header style={{ padding: 16, borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h2 style={{ margin: 0 }}>My App</h2>
      <Icon username={username} />
    </header>
  );
};

export default function App() {
  const [username, setUsername] = React.useState('');

  return (
    <div style={{ fontFamily: 'system-ui, Roboto, Arial', maxWidth: 720, margin: '40px auto', padding: 16 }}>
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ padding: 8, border: '1px solid #ccc', borderRadius: 6, width: '100%' }}
        />
      </div>
      <Header username={username} />
    </div>
  );
}
  */