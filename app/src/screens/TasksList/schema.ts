import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';

export type TasksListNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'TasksList'
>;

export type TasksListRouteProp = RouteProp<RootStackParamList, 'TasksList'>;
