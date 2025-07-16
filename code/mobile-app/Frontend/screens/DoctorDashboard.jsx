import React, { useState, useEffect } from "react";
import { 
  View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, 
  RefreshControl, Image, Alert, Modal, ScrollView, TextInput
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DoctorDashboard() {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [flapData, setFlapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flapLoading, setFlapLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [token, setToken] = useState("");
  const [tokenLoaded, setTokenLoaded] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showingFlapData, setShowingFlapData] = useState(false);

  const navigation = useNavigation();
  const API_URL = "http://172.20.10.6:5001";
  const BASE_URL = `${API_URL}/api/users`;

  // Filter patients based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(patient =>
        patient.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.contact?.includes(searchQuery) ||
        patient.age?.toString().includes(searchQuery)
      );
      setFilteredPatients(filtered);
    }
  }, [searchQuery, patients]);

  useEffect(() => {
    const initializeToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("userToken");
        if (storedToken) {
          setToken(storedToken);
        } else {
          showFriendlyAlert("Authentication Required", "Please login to access the dashboard.");
          setLoading(false);
        }
      } catch (error) {
        console.error("Error retrieving token:", error);
        showFriendlyAlert("Error", "Unable to retrieve authentication. Please try again.");
        setLoading(false);
      } finally {
        setTokenLoaded(true);
      }
    };
    initializeToken();
  }, []);

  useEffect(() => {
    if (tokenLoaded && token) {
      getPatients();
    }
  }, [token, tokenLoaded]);

  const showFriendlyAlert = (title, message, onPress = null) => {
    Alert.alert(
      title,
      message,
      [
        {
          text: "OK",
          onPress: onPress,
          style: "default"
        }
      ],
      { cancelable: true }
    );
  };

  const getPatients = async () => {
    if (!token) {
      showFriendlyAlert("Authentication Required", "Please login to view your patients.");
      setLoading(false);
      return;
    }

    try {
      setError("");
      setLoading(true);

      const response = await axios.get(
        `${BASE_URL}/doctors/patients`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setPatients(response.data.patients || []);
        setDoctorInfo(response.data.doctorInfo);
      } else {
        setError("Unable to load your patients. Please try again.");
        setPatients([]);
      }
    } catch (error) {
      console.error("Error fetching assigned patients:", error);

      if (error.response?.status === 401) {
        showFriendlyAlert(
          "Session Expired", 
          "Your session has expired. Please login again.",
          async () => {
            await AsyncStorage.removeItem("userToken");
            setToken("");
            navigation.navigate("Login");
          }
        );
      } else if (error.response?.status === 403) {
        setError("Access denied. Only doctors can view assigned patients. Please contact support if you believe this is an error.");
        setPatients([]);
      } else if (error.response?.status === 404) {
        setError("Your doctor profile was not found. Please contact support for assistance.");
        setPatients([]);
      } else {
        const errorMessage = error.response?.data?.error || 
                           error.response?.data?.message || 
                           "Unable to load patients. Please check your connection and try again.";
        setError(errorMessage);
      }
      setPatients([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    if (!token) {
      showFriendlyAlert("Authentication Required", "Please login again to refresh data.");
      return;
    }
    setRefreshing(true);
    getPatients();
  };

  const handleFetchFlapData = async (patient) => {
    if (!token) {
      showFriendlyAlert("Authentication Required", "Please login again to view flap data.");
      return;
    }

    setSelectedPatientId(patient._id);
    setSelectedPatient(patient);
    setFlapData([]);
    setFlapLoading(true);
    setError("");
    setShowingFlapData(true);

    try {
      const response = await axios.get(`${BASE_URL}/flap/search/${patient._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (response.data.records) {
        setFlapData(response.data.records);
        if (response.data.records.length === 0) {
          showFriendlyAlert("No Data", `No flap monitoring data found for ${patient.name}.`);
        }
      } else {
        setFlapData(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching flap data:", error);

      if (error.response?.status === 404) {
        const errorMessage = (error.response?.data?.error || error.response?.data?.message || "").toLowerCase();
        if (
          errorMessage.includes("no flap data found") ||
          errorMessage.includes("not found")
        ) {
          setFlapData([]);
          showFriendlyAlert("No Data", `No flap monitoring data found for ${patient.name}.`);
        } else {
          setError("Patient data not found.");
        }
      } else if (error.response?.status === 401) {
        showFriendlyAlert(
          "Session Expired", 
          "Your session has expired. Please login again.",
          async () => {
            await AsyncStorage.removeItem("userToken");
            setToken("");
            navigation.navigate("Login");
          }
        );
      } else if (error.response?.status === 403) {
        setError("Access denied. Only doctors can view flap data. Please contact support if you believe this is an error.");
      } else {
        setError("Unable to load flap data. Please try again.");
      }
    } finally {
      setFlapLoading(false);
    }
  };

  const backToPatientList = () => {
    setSelectedPatientId(null);
    setSelectedPatient(null);
    setFlapData([]);
    setError("");
    setShowingFlapData(false);
  };

  const handleImagePress = (imageUrl) => {
    setSelectedImage(imageUrl);
    setModalVisible(true);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const getTemperatureColor = (temp) => {
    if (temp == null) return "#999";
    if (temp < 35) return "#3498db"; // Blue for low
    if (temp > 37.5) return "#e74c3c"; // Red for high
    return "#2ecc71"; // Green for normal
  };

  if (!tokenLoaded) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#10e0f8" />
        <Text style={styles.loadingText}>Setting up your dashboard...</Text>
      </View>
    );
  }

  if (!token) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Doctor Dashboard</Text>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>Welcome to your patient dashboard!</Text>
          <Text style={styles.subText}>Please login to view your assigned patients.</Text>
          <TouchableOpacity style={[styles.primaryButton, { flex: 1 }]} onPress={() => navigation.navigate("Login")}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // If showing flap data, render the flap data view
  if (showingFlapData) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Flap Monitoring Data</Text>
        
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={backToPatientList}>
          <Text style={styles.backButtonText}>← Back to Patient List</Text>
        </TouchableOpacity>

        <View style={styles.patientHeaderContainer}>
          <Text style={styles.patientHeaderName}>Patient: {selectedPatient?.name}</Text>
          <Text style={styles.patientHeaderInfo}>
            Age: {selectedPatient?.age || "N/A"} | Contact: {selectedPatient?.contact || "N/A"}
          </Text>
        </View>
        
        <View style={styles.flapContainer}>
          <Text style={styles.sectionTitle}>
            🔬 Flap Monitoring Records
            {flapData.length > 0 && ` (${flapData.length} records)`}
          </Text>
          
          {flapLoading ? (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color="#10e0f8" />
              <Text style={styles.loadingText}>Loading flap data...</Text>
            </View>
          ) : error && flapData.length === 0 ? (
            <View style={styles.flapErrorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity 
                style={[styles.primaryButton, { flex: 1 }]} 
                onPress={() => handleFetchFlapData(selectedPatient)}
              >
                <Text style={styles.buttonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : flapData.length > 0 ? (
            <FlatList
              data={flapData}
              keyExtractor={(item, index) => item._id || index.toString()}
              renderItem={({ item }) => (
                <View style={styles.flapCard}>
                  <View style={styles.flapCardHeader}>
                    <Text style={[styles.temperatureText, { color: getTemperatureColor(item.temperature) }]}>
                      🌡️ {item.temperature != null ? `${item.temperature.toFixed(1)}°C` : "N/A"}
                    </Text>
                    <Text style={styles.timestampText}>
                      🕐 {formatDate(item.timestamp)}
                    </Text>
                  </View>
                  
                  {item.image_url ? (
                    <TouchableOpacity 
                      style={styles.imageContainer}
                      onPress={() => handleImagePress(item.image_url)}
                    >
                      <Image
                        source={{ uri: item.image_url }}
                        style={styles.flapImage}
                        resizeMode="cover"
                      />
                      <Text style={styles.imageHint}>Tap to view full size</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.noImageContainer}>
                      <Text style={styles.noImageText}>📷 No image available</Text>
                    </View>
                  )}
                </View>
              )}
              style={styles.flapList}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>📊 No flap monitoring data available for this patient.</Text>
            </View>
          )}
        </View>

        {/* Image Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity 
              style={styles.modalBackground}
              onPress={() => setModalVisible(false)}
            >
              <View style={styles.modalContent}>
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>✕ Close</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Doctor Dashboard</Text>
      
      {doctorInfo && (
        <View style={styles.doctorInfoContainer}>
          <Text style={styles.doctorInfoText}>Welcome back, Dr. {doctorInfo.name}! 👨‍⚕️</Text>
          <Text style={styles.doctorInfoSubText}>{doctorInfo.specialty}</Text>
        </View>
      )}

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#10e0f8" />
          <Text style={styles.loadingText}>Loading your patients...</Text>
        </View>
      ) : error ? (
        <View style={styles.accessDeniedContainer}>
          <Text style={styles.accessDeniedTitle}>🚫 Access Denied</Text>
          <Text style={styles.accessDeniedText}>{error}</Text>
          <View style={styles.accessDeniedButtonContainer}>
            <TouchableOpacity style={styles.primaryButton} onPress={() => getPatients()}>
              <Text style={styles.buttonText}>🔄 Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.logoutButton} 
              onPress={async () => {
                await AsyncStorage.removeItem("userToken");
                setToken("");
                navigation.navigate("Login");
              }}
            >
              <Text style={styles.buttonText}>🚪 Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : patients.length === 0 ? (
        <View style={styles.noAssignedPatientsContainer}>
          <Text style={styles.noAssignedPatientsTitle}>👥 No Assigned Patients</Text>
          <Text style={styles.noAssignedPatientsText}>
            You currently don't have any patients assigned to you. 
            {"\n\n"}
            New patient assignments will appear here automatically when they are made by the administration.
          </Text>
          <TouchableOpacity style={[styles.primaryButton, { flex: 1 }]} onPress={() => getPatients()}>
            <Text style={styles.buttonText}>🔄 Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search patients by name, contact, or age..."
              placeholderTextColor="#aaa"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <Text style={styles.patientCount}>
            📋 {filteredPatients.length} of {patients.length} patients
            {searchQuery ? " (filtered)" : ""}
          </Text>

          <FlatList
            data={filteredPatients}
            keyExtractor={(item, index) => item._id || index.toString()}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh}
                colors={["#10e0f8"]}
                tintColor="#10e0f8"
              />
            }
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.patientName}>{item.name ?? "Unknown Patient"}</Text>
                  <Text style={styles.patientAge}>{item.age ?? "N/A"} years</Text>
                </View>
                
                <View style={styles.cardContent}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>📞 Contact:</Text>
                    <Text style={styles.infoValue}>{item.contact ?? "Not provided"}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>👤 Gender:</Text>
                    <Text style={styles.infoValue}>{item.gender ?? "Not specified"}</Text>
                  </View>
                  {item.medicalHistory && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>🏥 Medical History:</Text>
                      <Text style={styles.infoValue}>{item.medicalHistory}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity 
                    style={[styles.primaryButton, { flex: 1 }]} 
                    onPress={() => handleFetchFlapData(item)}
                  >
                    <Text style={styles.buttonText}>📊 View Flap Data</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#465a6e",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 60,
    textAlign: "center",
    marginBottom: 10,
  },
  backButton: {
    backgroundColor: "#34495e",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  backButtonText: {
    color: "#10e0f8",
    fontSize: 16,
    fontWeight: "600",
  },
  patientHeaderContainer: {
    backgroundColor: "#34495e",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  patientHeaderName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  patientHeaderInfo: {
    fontSize: 14,
    color: "#bdc3c7",
  },
  welcomeContainer: {
    backgroundColor: "#2c3e50",
    padding: 30,
    borderRadius: 15,
    marginTop: 50,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
    color: "#bdc3c7",
    textAlign: "center",
    marginBottom: 25,
  },
  doctorInfoContainer: {
    backgroundColor: "#34495e",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  doctorInfoText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#f0f0f0",
    textAlign: "center",
  },
  doctorInfoSubText: {
    fontSize: 14,
    color: "#a0a0a0",
    marginTop: 5,
  },
  searchContainer: {
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: "#34495e",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  patientCount: {
    color: "#e1e1e1",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 15,
  },
  card: {
    backgroundColor: "#2c3e50",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  patientName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
  },
  patientAge: {
    fontSize: 14,
    color: "#bdc3c7",
    fontWeight: "500",
  },
  cardContent: {
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "flex-start",
  },
  infoLabel: {
    fontSize: 14,
    color: "#10e0f8",
    fontWeight: "500",
    minWidth: 100,
  },
  infoValue: {
    fontSize: 14,
    color: "#eee",
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  primaryButton: {
    backgroundColor: "#10e0f8",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    flex: 0.45,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  buttonText: {
    color: "#0d0d0d",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  noAssignedPatientsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2c3e50",
    margin: 20,
    padding: 40,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  noAssignedPatientsTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  noAssignedPatientsText: {
    fontSize: 16,
    color: "#bdc3c7",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },
  flapContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#10e0f8",
    marginBottom: 15,
  },
  flapList: {
    flex: 1,
  },
  flapCard: {
    backgroundColor: "#34495e",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  flapCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  temperatureText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  timestampText: {
    fontSize: 14,
    color: "#bdc3c7",
  },
  imageContainer: {
    alignItems: "center",
    backgroundColor: "#2c3e50",
    borderRadius: 8,
    padding: 10,
  },
  flapImage: {
    width: 250,
    height: 180,
    borderRadius: 8,
  },
  imageHint: {
    fontSize: 12,
    color: "#bdc3c7",
    marginTop: 8,
    fontStyle: "italic",
  },
  noImageContainer: {
    alignItems: "center",
    padding: 20,
  },
  noImageText: {
    color: "#aaa",
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  noDataText: {
    color: "#bdc3c7",
    fontStyle: "italic",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  loadingText: {
    color: "#10e0f8",
    marginTop: 10,
    fontSize: 16,
  },
  accessDeniedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e74c3c",
    margin: 20,
    padding: 40,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  accessDeniedText: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },
  accessDeniedButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  logoutButton: {
    backgroundColor: "#34495e",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    flex: 0.45,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  errorText: {
    color: "#fff",
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 20,
    fontSize: 16,
    lineHeight: 22,
  },
  flapErrorContainer: {
    backgroundColor: "#e74c3c",
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackground: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    maxWidth: "95%",
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  modalImage: {
    width: 350,
    height: 350,
    borderRadius: 10,
  },
  closeButton: {
    backgroundColor: "#10e0f8",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginTop: 20,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  closeButtonText: {
    color: "#0d0d0d",
    fontWeight: "bold",
    fontSize: 16,
  },
});