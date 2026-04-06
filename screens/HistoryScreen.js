import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { db, auth } from '../App';
import { collection, getDocs } from 'firebase/firestore';
import { Calendar } from 'react-native-calendars';

export default function HistoryScreen() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [filterType, setFilterType] = useState('all'); // 'all', 'today', 'custom'

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [attendanceRecords, selectedDate, filterType]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      
      if (!user) {
        setError("Please login to view attendance history");
        setLoading(false);
        return;
      }

      console.log("Fetching records for user:", user.uid);
      
      const querySnapshot = await getDocs(collection(db, 'attendance'));
      const allRecords = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.userId === user.uid) {
          allRecords.push({
            id: doc.id,
            ...data,
            date: data.timestamp ? data.timestamp.toDate() : new Date(data.markedAt || Date.now())
          });
        }
      });

      allRecords.sort((a, b) => b.date - a.date);
      setAttendanceRecords(allRecords);
      setError(null);

    } catch (error) {
      console.error("Error fetching records:", error);
      setError("Failed to load attendance records. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...attendanceRecords];

    if (filterType === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.date);
        recordDate.setHours(0, 0, 0, 0);
        return recordDate.getTime() === today.getTime();
      });
    } else if (filterType === 'custom' && selectedDate) {
      const filterDate = new Date(selectedDate);
      filterDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.date);
        recordDate.setHours(0, 0, 0, 0);
        return recordDate.getTime() === filterDate.getTime();
      });
    }

    setFilteredRecords(filtered);
  };

  const formatDate = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date)) {
      return 'Unknown date';
    }
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFilterButtonText = () => {
    if (filterType === 'today') return 'Today';
    if (filterType === 'custom' && selectedDate) {
      return new Date(selectedDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
    return 'All Records';
  };

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    setFilterType('custom');
    setFilterModalVisible(false);
  };

  const clearFilter = () => {
    setSelectedDate(null);
    setFilterType('all');
  };

  const renderItem = ({ item }) => (
    <View style={styles.record}>
      <Text style={styles.userName}>{item.userName || 'No Name'}</Text>
      <Text style={styles.date}>{formatDate(item.date)}</Text>
      <Text style={styles.type}>Type: {item.type || 'check-in'}</Text>
      <Text style={styles.status}>Status: {item.status || 'present'}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your attendance history...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error</Text>
        <Text style={styles.errorSubText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Attendance History</Text>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Text style={styles.filterButtonText}>{getFilterButtonText()}</Text>
          <Text style={styles.filterIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {filterType !== 'all' && (
        <TouchableOpacity onPress={clearFilter} style={styles.clearFilterButton}>
          <Text style={styles.clearFilterText}>Clear Filter</Text>
        </TouchableOpacity>
      )}

      {filteredRecords.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.noRecords}>
            {filterType === 'all' ? 'No attendance records yet' : 'No records found for selected filter'}
          </Text>
          <Text style={styles.noRecordsSub}>
            {filterType === 'all' 
              ? 'Mark your first attendance using the Camera tab'
              : 'Try a different date or clear the filter'
            }
          </Text>
        </View>
      ) : (
        <>
          <Text style={styles.subtitle}>
            Showing {filteredRecords.length} of {attendanceRecords.length} records
          </Text>
          <FlatList
            data={filteredRecords}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
          />
        </>
      )}

      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Records</Text>
            
            <TouchableOpacity 
              style={[styles.filterOption, filterType === 'all' && styles.filterOptionSelected]}
              onPress={() => {
                setFilterType('all');
                setFilterModalVisible(false);
              }}
            >
              <Text style={styles.filterOptionText}>All Records</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.filterOption, filterType === 'today' && styles.filterOptionSelected]}
              onPress={() => {
                setFilterType('today');
                setFilterModalVisible(false);
              }}
            >
              <Text style={styles.filterOptionText}>Today</Text>
            </TouchableOpacity>

            <Text style={styles.calendarTitle}>Select Specific Date:</Text>
            <Calendar
              onDayPress={handleDayPress}
              markedDates={{
                [selectedDate]: {selected: true, selectedColor: '#007AFF'}
              }}
              theme={{
                todayTextColor: '#007AFF',
                arrowColor: '#007AFF',
                selectedDayBackgroundColor: '#007AFF',
              }}
            />

            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setFilterModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20,
    backgroundColor: '#f8f9fa'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterButtonText: {
    color: 'white',
    fontWeight: '600',
    marginRight: 8,
  },
  filterIcon: {
    fontSize: 16,
  },
  clearFilterButton: {
    backgroundColor: '#6c757d',
    padding: 8,
    borderRadius: 15,
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  clearFilterText: {
    color: 'white',
    fontSize: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 15,
  },
  listContent: {
    paddingBottom: 20,
  },
  record: { 
    padding: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: '#ddd',
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 6,
  },
  type: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 12,
    color: '#6c757d',
    fontSize: 16,
  },
  errorText: {
    fontSize: 20,
    color: '#dc3545',
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  noRecords: {
    fontSize: 18,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 8,
  },
  noRecordsSub: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2c3e50',
  },
  filterOption: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 10,
  },
  filterOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#2c3e50',
    textAlign: 'center',
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    color: '#2c3e50',
  },
  closeButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#dc3545',
    borderRadius: 10,
  },
  closeButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
});