import React from 'react';
import parse from 'html-react-parser';

interface HeaderCodeInjectionProps {
  code: string;
}

const HeaderCodeInjection: React.FC<HeaderCodeInjectionProps> = ({ code }) => {
  return <>{parse(code)}</>;
};

export default HeaderCodeInjection; 