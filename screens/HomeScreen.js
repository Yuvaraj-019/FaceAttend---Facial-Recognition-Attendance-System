import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../App';
import { signOut } from 'firebase/auth';

export default function HomeScreen({ navigation }) {
  const handleLogout = async () => {
    await signOut(auth);
    navigation.navigate('Login');
  };

  const menuItems = [
    {
      title: 'Mark Attendance',
      icon: 'camera',
      color: '#007AFF',
      onPress: () => navigation.navigate('Attendance'),
      description: 'Use camera to mark your attendance'
    },
    {
      title: 'View History',
      icon: 'time',
      color: '#34C759',
      onPress: () => navigation.navigate('History'),
      description: 'Check your attendance records'
    },
    {
      title: 'Admin Panel',
      icon: 'shield-checkmark',
      color: '#FF9500',
      onPress: () => navigation.navigate('Admin'),
      description: 'Manage all attendance data'
    },
    {
      title: 'Logout',
      icon: 'log-out',
      color: '#FF3B30',
      onPress: handleLogout,
      description: 'Sign out from your account'
    }
  ];

  const user = auth.currentUser;
  const userName = user?.displayName || user?.email?.split('@')[0] || 'User';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{userName}!</Text>
            <Text style={styles.subtitle}>Manage your attendance easily</Text>
          </View>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#ffffff" />
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="calendar" size={24} color="#007AFF" />
            <Text style={styles.statNumber}>28</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={24} color="#34C759" />
            <Text style={styles.statNumber}>95%</Text>
            <Text style={styles.statLabel}>Attendance</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time" size={24} color="#FF9500" />
            <Text style={styles.statNumber}>9:15</Text>
            <Text style={styles.statLabel}>Avg. Time</Text>
          </View>
        </View>

        {/* Quick Actions Section */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon} size={24} color="#ffffff" />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activity Section */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.recentActivity}>
          <View style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: '#34C75920' }]}>
              <Ionicons name="checkmark" size={16} color="#34C759" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Attendance marked</Text>
              <Text style={styles.activityTime}>Today, 9:15 AM</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: '#007AFF20' }]}>
              <Ionicons name="camera" size={16} color="#007AFF" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Photo verified</Text>
              <Text style={styles.activityTime}>Yesterday, 9:10 AM</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>FaceAttend v1.0</Text>
          <Text style={styles.footerSubText}>Smart Attendance System</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  welcomeContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
    marginTop: 10,
  },
  menuContainer: {
    marginBottom: 30,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 12,
    color: '#8E8E93',
  },
  recentActivity: {
    marginBottom: 30,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  footer: {
    alignItems: 'center',
    padding: 20,
    marginTop: 10,
  },
  footerText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  footerSubText: {
    fontSize: 12,
    color: '#C7C7CC',
    marginTop: 4,
  },
});