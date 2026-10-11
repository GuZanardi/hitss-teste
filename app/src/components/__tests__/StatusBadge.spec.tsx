import React from 'react';
import { render } from '@testing-library/react-native';
import { StatusBadge } from '../StatusBadge';

describe('StatusBadge Component', () => {
  it('should render "pendente" for PENDING status', () => {
    const { getByText } = render(<StatusBadge status="PENDING" />);
    expect(getByText('pendente')).toBeTruthy();
  });

  it('should render "em progresso" for IN_PROGRESS status', () => {
    const { getByText } = render(<StatusBadge status="IN_PROGRESS" />);
    expect(getByText('em progresso')).toBeTruthy();
  });

  it('should render "concluída" for COMPLETED status', () => {
    const { getByText } = render(<StatusBadge status="COMPLETED" />);
    expect(getByText('concluída')).toBeTruthy();
  });
});

