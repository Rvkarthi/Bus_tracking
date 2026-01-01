import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { api } from '../context';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // In prod, this URL should be env var
        const newSocket = io(api);
        setSocket(newSocket);

        return () => newSocket.close();
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
