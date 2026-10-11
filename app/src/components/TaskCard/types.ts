import { Task, TaskStatus } from '../../types';

export interface TaskCardProps {
  task: Task;
  onPress: () => void;
  onQuickToggleStatus?: (newStatus: TaskStatus) => void;
}

