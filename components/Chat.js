import React, { useState } from 'react';

function Chat() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);

    const handleSend = async () => {
        if (!input) return;

        const userMessage = { role: 'user', content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: input }),
        });

        const data = await response.json();

        if (data.response) {
            const aiMessage = { role: 'assistant', content: data.response };
            setMessages((prev) => [...prev, aiMessage]);
        } else {
            console.error('Error:', data.error);
        }
    };

    return (
        <div className="chat-container">
            <div className="messages">
                {messages.map((msg, index) => (
                    <div key={index} className={msg.role}>
                        <strong>{msg.role === 'user' ? 'Tú' : 'IA'}:</strong> {msg.content}
                    </div>
                ))}
            </div>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Escribe tu mensaje..."
            />
            <button onClick={handleSend}>Enviar</button>
        </div>
    );
}

export default Chat; 