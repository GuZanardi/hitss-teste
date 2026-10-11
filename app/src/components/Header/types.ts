import React from 'react';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onDelete?: () => void;
  renderIcon?: () => React.ReactNode;
}

