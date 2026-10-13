import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { TeamsListScreen } from '../screens/TeamsList';
import { CreateTeamScreen } from '../screens/CreateTeam';
import { TasksListScreen } from '../screens/TasksList';
import { CreateTaskScreen } from '../screens/CreateTask';
import { EditTaskScreen } from '../screens/EditTask';
import { EditTeamScreen } from '../screens/EditTeam';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="TeamsList"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#121214' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="TeamsList" component={TeamsListScreen} />
      <Stack.Screen name="CreateTeam" component={CreateTeamScreen} />
      <Stack.Screen name="EditTeam" component={EditTeamScreen} />
      <Stack.Screen name="TasksList" component={TasksListScreen} />
      <Stack.Screen name="CreateTask" component={CreateTaskScreen} />
      <Stack.Screen name="EditTask" component={EditTaskScreen} />
    </Stack.Navigator>
  );
};
