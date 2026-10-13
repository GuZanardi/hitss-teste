import { createTaskSchema } from '../CreateTask/types';
import { editTaskSchema } from '../EditTask/types';

const baseTask = {
  title: 'Uma tarefa',
  status: 'PENDING' as const,
  teamIds: [],
};

describe('task form validation', () => {
  it.each([
    ['creation', createTaskSchema],
    ['editing', editTaskSchema],
  ])('requires a non-empty description when %s a task', (_action, schema) => {
    expect(schema.safeParse(baseTask).success).toBe(false);
    expect(schema.safeParse({ ...baseTask, description: '   ' }).success).toBe(false);
    expect(
      schema.safeParse({ ...baseTask, description: 'Detalhes obrigatórios' }).success,
    ).toBe(true);
  });
});
