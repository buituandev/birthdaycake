import React from 'react';

interface CongratsMessageProps {
  name: string;
  playing: boolean;
}

export const CongratsMessage: React.FC<CongratsMessageProps> = ({ name, playing }) => {
  return (
    <div 
      style={{
        textAlign: 'center',
        marginTop: '1rem',
        fontFamily: 'Montserrat, sans-serif',
        color: '#fff',
        opacity: playing ? 1 : 0,
        transition: 'opacity 0.5s ease-in-out',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        textShadow: '0 0 5px rgba(255, 255, 255, 0.5)'
      }}
    >
      <p>🎉 Congratulations {name}! 🎉</p>
      <p>Wishing you an amazing birthday filled with joy and happiness!</p>
    </div>
  );
};