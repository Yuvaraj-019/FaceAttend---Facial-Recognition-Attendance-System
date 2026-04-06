import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet, Alert, ActivityIndicator, Image, TextInput } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { db, auth } from '../App';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function AttendanceScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraError, setCameraError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [step, setStep] = useState(1); // 1: camera, 2: preview, 3: success
  const [userName, setUserName] = useState(auth.currentUser?.displayName || '');
  const cameraRef = useRef(null);

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const takePicture = async () => {
    if (!cameraReady || isLoading) return;
    
    setIsLoading(true);
    
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
        exif: false,
      });
      
      setCapturedPhoto(photo);
      setStep(2); // Move to preview step
      
    } catch (error) {
      console.error("Error taking picture:", error);
      Alert.alert("Error", "Failed to capture image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNameSubmit = () => {
    if (userName.trim().length < 2) {
      Alert.alert("Error", "Please enter a valid name (at least 2 characters)");
      return;
    }
    confirmAttendance();
  };

  const confirmAttendance = async () => {
    if (!capturedPhoto) return;
    
    setIsLoading(true);
    
    try {
      const user = auth.currentUser;
      if (user) {
        const attendanceData = {
          userId: user.uid,
          userName: userName.trim(), // Use the entered name
          userEmail: user.email,
          timestamp: serverTimestamp(),
          type: 'check-in',
          status: 'present',
          markedAt: new Date().toISOString(),
          location: 'Office',
          method: 'photo_verification',
          photoUri: capturedPhoto.uri,
          verified: true
        };

        await addDoc(collection(db, 'attendance'), attendanceData);
        
        setStep(3); // Success step
        setAttendanceMarked(true);
        Alert.alert("Success", "Attendance marked successfully! ✅");
      } else {
        Alert.alert("Error", "Please login to mark attendance");
      }
    } catch (error) {
      console.error("Error marking attendance:", error);
      Alert.alert("Error", "Failed to mark attendance. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const retakePicture = () => {
    setCapturedPhoto(null);
    setStep(1);
  };

  const handleCameraReady = () => {
    console.log('Camera is ready');
    setCameraReady(true);
  };

  const handleCameraError = (error) => {
    console.error('Camera error:', error);
    setCameraError(error.message);
    setCameraReady(false);
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Camera Permission Required</Text>
        <Text style={styles.subText}>We need camera access to verify your attendance</Text>
        <Button title="Grant Camera Access" onPress={requestPermission} />
      </View>
    );
  }

  // Step 3: Success screen
  if (step === 3) {
    return (
      <View style={styles.container}>
        <View style={styles.successIcon}>
          <Text style={styles.successIconText}>✅</Text>
        </View>
        <Text style={styles.successTitle}>Attendance Recorded!</Text>
        <Text style={styles.successSubtitle}>Your attendance has been successfully marked</Text>
        <Text style={styles.successTime}>{new Date().toLocaleString()}</Text>
        
        <View style={styles.successButtons}>
          <Button
            title="Mark Another Attendance"
            onPress={() => {
              setStep(1);
              setCapturedPhoto(null);
              setAttendanceMarked(false);
              setUserName(auth.currentUser?.displayName || '');
            }}
            color="#007AFF"
          />
        </View>
      </View>
    );
  }

  // Step 2: Photo preview
  if (step === 2 && capturedPhoto) {
    return (
      <View style={styles.container}>
        <Text style={styles.previewTitle}>Photo Preview</Text>
        <Image source={{ uri: capturedPhoto.uri }} style={styles.previewImage} />
        <Text style={styles.previewText}>Is this photo okay for attendance?</Text>
        
        {/* Name Input Field */}
        <View style={styles.nameInputContainer}>
          <Text style={styles.nameLabel}>Your Name:</Text>
          <TextInput
            style={styles.nameInput}
            value={userName}
            onChangeText={setUserName}
            placeholder="Enter your name"
            placeholderTextColor="#999"
            maxLength={50}
            editable={!isLoading}
          />
        </View>
        
        <View style={styles.buttonRow}>
          <Button
            title="Retake"
            onPress={retakePicture}
            color="#6c757d"
            disabled={isLoading}
          />
          <View style={styles.buttonSpacer} />
          <Button
            title="Confirm Attendance"
            onPress={handleNameSubmit}
            color="#28a745"
            disabled={isLoading || userName.trim().length < 2}
          />
        </View>
        
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.loadingText}>Processing...</Text>
          </View>
        )}
      </View>
    );
  }

  // Step 1: Camera view
  return (
    <View style={styles.container}>
      <View style={styles.cameraWrapper}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="front"
          onCameraReady={handleCameraReady}
          onError={handleCameraError}
        />
        
        {/* Camera overlay guide */}
        <View style={styles.cameraOverlay}>
          <View style={styles.guideFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <Text style={styles.overlayText}>Position your face within the frame</Text>
        </View>
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.status}>
          {cameraReady ? "✅ Camera Ready" : "⏳ Initializing Camera..."}
        </Text>
        
        {!cameraReady && (
          <ActivityIndicator size="small" color="#007AFF" style={styles.cameraLoading} />
        )}
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title={isLoading ? "Capturing..." : "Capture Photo for Attendance"}
          onPress={takePicture}
          disabled={isLoading || !cameraReady}
          color="#007AFF"
        />
      </View>

      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>Instructions:</Text>
        <Text style={styles.instruction}>• Face the camera directly</Text>
        <Text style={styles.instruction}>• Ensure good lighting</Text>
        <Text style={styles.instruction}>• Press the button to capture</Text>
        <Text style={styles.instruction}>• Review and confirm your photo</Text>
        <Text style={styles.instruction}>• Enter your name before confirming</Text>
      </View>

      {cameraError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Camera Error: {cameraError}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20 
  },
  cameraWrapper: {
    width: '100%',
    height: '50%',
    position: 'relative',
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  camera: { 
    width: '100%', 
    height: '100%',
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  guideFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 125,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#fff',
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  overlayText: {
    color: 'white',
    fontSize: 14,
    marginTop: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  status: { 
    fontSize: 16, 
    fontWeight: '600',
    marginBottom: 8,
    color: '#2c3e50'
  },
  buttonContainer: {
    marginVertical: 15,
    width: '100%',
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
  },
  previewImage: {
    width: 300,
    height: 300,
    borderRadius: 12,
    marginBottom: 20,
  },
  previewText: {
    fontSize: 16,
    marginBottom: 20,
    color: '#6c757d',
  },
  // Name input styles
  nameInputContainer: {
    width: '100%',
    marginBottom: 20,
    marginTop: 10,
  },
  nameLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#2c3e50',
    textAlign: 'center',
  },
  nameInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 300,
  },
  buttonSpacer: {
    width: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  loadingText: {
    marginTop: 8,
    color: '#6c757d',
  },
  successIcon: {
    marginBottom: 20,
  },
  successIconText: {
    fontSize: 60,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 10,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 10,
    textAlign: 'center',
  },
  successTime: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 30,
  },
  successButtons: {
    width: '100%',
    maxWidth: 300,
  },
  instructionsContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    width: '100%',
  },
  instructionsTitle: {
    fontWeight: '600',
    color: '#1565c0',
    marginBottom: 8,
    fontSize: 14,
  },
  instruction: {
    color: '#1976d2',
    fontSize: 12,
    marginBottom: 4,
  },
  permissionText: {
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center',
    color: '#2c3e50',
    fontWeight: '600',
  },
  subText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f8d7da',
    borderRadius: 5,
    width: '100%',
  },
  errorText: {
    color: '#721c24',
    textAlign: 'center',
  },
});