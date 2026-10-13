import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TaskCard } from '../TaskCard';

const task = {
  id: 'task-1',
  title: 'Revisar integração',
  description: 'Validar comportamento',
  status: 'PENDING' as const,
  dueDate: null,
  createdAt: '2026-10-12T12:00:00.000Z',
  updatedAt: '2026-10-12T12:00:00.000Z',
  teams: [{ id: 'team-1', name: 'Mobile', colorHex: '#00B37E' }],
};

describe('TaskCard', () => {
  it('renders task details, associated teams, and opens on press', () => {
    const onPress = jest.fn();
    const { getByText } = render(<TaskCard task={task} onPress={onPress} />);
    expect(getByText('Revisar integração')).toBeTruthy();
    expect(getByText('Validar comportamento')).toBeTruthy();
    expect(getByText('Mobile')).toBeTruthy();
    fireEvent.press(getByText('Revisar integração'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('handles tasks without a team or description and quick status changes', () => {
    const onQuickToggleStatus = jest.fn();
    const { getByText } = render(
      <TaskCard
        task={{ ...task, teams: [], description: null }}
        onPress={jest.fn()}
        onQuickToggleStatus={onQuickToggleStatus}
      />,
    );
    expect(getByText('Sem time atribuído')).toBeTruthy();
    fireEvent.press(getByText('pendente'));
    expect(onQuickToggleStatus).toHaveBeenCalledWith('IN_PROGRESS');
  });
});
