import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { TeamsListScreen } from '../screens/TeamsListScreen';
import { CreateTeamScreen } from '../screens/CreateTeamScreen';
import { TasksListScreen } from '../screens/TasksListScreen';
import { CreateTaskScreen } from '../screens/CreateTaskScreen';
import { EditTaskScreen } from '../screens/EditTaskScreen';

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
      <Stack.Screen name="TasksList" component={TasksListScreen} />
      <Stack.Screen name="CreateTask" component={CreateTaskScreen} />
      <Stack.Screen name="EditTask" component={EditTaskScreen} />
    </Stack.Navigator>
  );
};

