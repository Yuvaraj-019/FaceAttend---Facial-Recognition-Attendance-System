import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import AttendanceScreen from './screens/AttendanceScreen';
import HistoryScreen from './screens/HistoryScreen';
import AdminScreen from './screens/AdminScreen';
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCBvwKQlNGq8rLJ4exVdo7U3ywS5RyTSVc",
  authDomain: "faceattend-ecdfa.firebaseapp.com",
  projectId: "faceattend-ecdfa",
  storageBucket: "faceattend-ecdfa.firebasestorage.app",
  messagingSenderId: "445142878129",
  appId: "1:445142878129:web:44be7dc878882fa6425f90",
  measurementId: "G-FS6WZQ873B"
};

const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
export const db = getFirestore(app);

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Attendance" component={AttendanceScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="Admin" component={AdminScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}