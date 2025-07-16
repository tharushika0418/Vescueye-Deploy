import React, { useEffect, useState, useContext } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  StyleSheet, 
  RefreshControl, 
  Image,
  TouchableOpacity,
  Alert
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
// Adjust the import path based on your project structure
// import { AuthContext } from "../contexts/AuthContext"; // Uncomment and adjust path as needed

const API_BASE_URL = "http://172.20.10.6:5001/api/users"; // Your backend URL

export default function DoctorProfile({ navigation }) {
  const [patients, setPatients] = useState([]);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  
  // Uncomment when you have AuthContext set up
  // const { user, logout } = useContext(AuthContext);

  // Load token on mount
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("userToken"); 
        if (!storedToken) {
          setError("No token found. Please login again.");
          setLoading(false);
          return;
        }
        setToken(storedToken);
      } catch (e) {
        setError("Failed to load authentication token.");
        setLoading(false);
      }
    };

    loadToken();
  }, []);

  // Fetch assigned patients once token is loaded
  useEffect(() => {
    if (token) {
      fetchAssignedPatients();
    }
  }, [token]);

  const fetchAssignedPatients = async () => {
    setError(null);
    if (!token) {
      setError("Authentication token missing.");
      setLoading(false);
      return;
    }
    try {
      if (!refreshing) setLoading(true);

      const response = await fetch(`${API_BASE_URL}/doctors/patients`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to fetch assigned patients.");
        setPatients([]);
      } else if (data.success) {
        setPatients(data.patients || []);
        setDoctorInfo(data.doctorInfo || null);
        setError(null);
      } else {
        setError(data.message || "No patients found.");
        setPatients([]);
      }
    } catch (err) {
      setError("Network error: " + err.message);
      setPatients([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAssignedPatients();
  };

  const handleEditProfile = () => {
    if (navigation) {
      navigation.navigate('EditProfile');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("userToken");
              // Uncomment when you have AuthContext
              // logout();
              if (navigation) {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              }
            } catch (error) {
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#10e0f8" />
        <Text style={styles.loadingText}>Loading patients...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={fetchAssignedPatients}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with doctor info and action buttons */}
      <View style={styles.headerContainer}>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleEditProfile}
          >
            <Ionicons name="create-outline" size={20} color="#10e0f8" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#ff6b6b" />
          </TouchableOpacity>
        </View>

        {doctorInfo && (
          <View style={styles.header}>
            {doctorInfo.profileImage ? (
              <Image 
                source={{ uri: doctorInfo.profileImage }} 
                style={styles.profileImage} 
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="person" size={40} color="#888" />
              </View>
            )}
            <Text style={styles.doctorName}>
              Dr. {doctorInfo.name || `${doctorInfo.firstName} ${doctorInfo.lastName}` || "N/A"}
            </Text>
            <Text style={styles.doctorSpecialty}>{doctorInfo.specialty || doctorInfo.speciality || "N/A"}</Text>
            <Text style={styles.doctorEmail}>{doctorInfo.email || "N/A"}</Text>
            {doctorInfo.telephone && (
              <Text style={styles.doctorPhone}>{doctorInfo.telephone}</Text>
            )}
          </View>
        )}
      </View>

      {/* Patients section */}
      <View style={styles.patientsContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Assigned Patients</Text>
          <Text style={styles.patientCount}>({patients.length})</Text>
        </View>

        {patients.length === 0 ? (
          <View style={styles.noDataContainer}>
            <Ionicons name="people-outline" size={50} color="#666" />
            <Text style={styles.noDataText}>No patients assigned yet.</Text>
          </View>
        ) : (
          <FlatList
            data={patients}
            keyExtractor={(item) => item._id || item.id || Math.random().toString()}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.patientCard}>
                <View style={styles.patientHeader}>
                  <Text style={styles.patientName}>{item.name || "N/A"}</Text>
                  <View style={styles.patientBadge}>
                    <Text style={styles.patientBadgeText}>
                      {item.age ? `${item.age}y` : "N/A"}
                    </Text>
                  </View>
                </View>
                <View style={styles.patientInfo}>
                  <View style={styles.infoRow}>
                    <Ionicons name="person-outline" size={16} color="#10e0f8" />
                    <Text style={styles.infoText}>Gender: {item.gender || "N/A"}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="call-outline" size={16} color="#10e0f8" />
                    <Text style={styles.infoText}>Contact: {item.contact || "N/A"}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={16} color="#10e0f8" />
                    <Text style={styles.infoText}>Address: {item.address || "N/A"}</Text>
                  </View>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#465a6e",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#465a6e",
  },
  loadingText: {
    marginTop: 10,
    color: "#10e0f8",
    fontSize: 14,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#2c3e50',
    padding: 12,
    borderRadius: 25,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#34495e',
  },
  header: {
    alignItems: "center",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#10e0f8",
  },
  placeholderImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#2c3e50",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#10e0f8",
  },
  doctorName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 18,
    color: "#a0c9e8",
    textAlign: "center",
    marginBottom: 2,
  },
  doctorEmail: {
    fontSize: 16,
    color: "#8fb1cc",
    textAlign: "center",
    marginBottom: 2,
  },
  doctorPhone: {
    fontSize: 16,
    color: "#8fb1cc",
    textAlign: "center",
  },
  patientsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    color: "#10e0f8",
    fontWeight: "bold",
  },
  patientCount: {
    fontSize: 16,
    color: "#a0c9e8",
    marginLeft: 8,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  noDataText: {
    fontStyle: "italic",
    color: "#bbb",
    textAlign: "center",
    fontSize: 16,
    marginTop: 10,
  },
  patientCard: {
    backgroundColor: "#2c3e50",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#34495e",
  },
  patientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  patientName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    flex: 1,
  },
  patientBadge: {
    backgroundColor: "#10e0f8",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  patientBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  patientInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    color: "#bbb",
    fontSize: 14,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#10e0f8",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});