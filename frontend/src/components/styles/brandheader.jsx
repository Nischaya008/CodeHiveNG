import React, { useState } from 'react';
import { Typography } from '@mui/material';

const BrandHeader = ({ variant = "h5", onClick, sx = {}, size = "normal" }) => {
  const [isCodeEffect, setIsCodeEffect] = useState(false);

  const handleClick = () => {
    if (onClick) {
      setIsCodeEffect(true);
      setTimeout(() => {
        onClick();
        setIsCodeEffect(false);
      }, 600);
    }
  };

  const sizeStyles = size === "large" ? {
    fontSize: '3.5rem',
    fontWeight: 'bold',
    padding: '1rem',
    textAlign: 'center',
    marginBottom: '1rem',
    '@media (max-width: 600px)': {
      fontSize: '2.5rem',
    }
  } : {};

  return (
    <Typography 
      variant={variant} 
      className={`brand-header ${isCodeEffect ? 'code-effect' : ''} ${size === "large" ? 'brand-header-large' : ''}`}
      onClick={handleClick}
      sx={{ 
        cursor: onClick ? 'pointer' : 'default',
        color: '#00ff95',
        transition: 'all 0.3s ease',
        ...sizeStyles,
        ...sx
      }}
    >
      {isCodeEffect ? (
        <>{'<'}<span className="brand-text-inner">CodeHiveNG</span>{'>'}</>
      ) : (
        'CodeHiveNG'
      )}
    </Typography>
  );
};

export default BrandHeader;