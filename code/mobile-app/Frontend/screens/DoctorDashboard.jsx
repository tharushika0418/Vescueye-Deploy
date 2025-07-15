import React, { useState, useEffect } from "react";
import { 
  View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, RefreshControl, Image 
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DoctorDashboard() {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [flapData, setFlapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flapLoading, setFlapLoading] = useState(false);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [token, setToken] = useState("");
  const [showPatients, setShowPatients] = useState(true);

  const navigation = useNavigation();
  const [doctorEmail, setDoctorEmail] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userId, setUserId] = useState("");
  const BASE_URL = "http://172.20.10.6:5001/api/users";

  useEffect(() => {
    const getStoredUserInfo = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("userToken");
        const storedEmail = await AsyncStorage.getItem("userEmail");
        const storedName = await AsyncStorage.getItem("userName");
        const storedRole = await AsyncStorage.getItem("userRole");
        const storedUserId = await AsyncStorage.getItem("userId");
        
        console.log("Retrieved from storage:", {
          token: storedToken ? "exists" : "missing",
          email: storedEmail,
          name: storedName,
          role: storedRole,
          userId: storedUserId
        });
        
        if (storedToken && storedEmail && storedRole) {
          setToken(storedToken);
          setDoctorEmail(storedEmail);
          // Use the actual stored name, or fallback to email prefix
          setDoctorName(storedName && storedName.trim() !== "" ? storedName : storedEmail.split('@')[0]);
          setUserRole(storedRole);
          setUserId(storedUserId);
        } else {
          console.log("Missing required user info in storage");
          setError("Authentication required. Please login again.");
          setLoading(false);
        }
      } catch (error) {
        console.error("Error retrieving user info:", error);
        setError("Authentication error. Please login again.");
        setLoading(false);
      }
    };
    
    getStoredUserInfo();
  }, []);

  const getPatients = async () => {
    if (!doctorEmail) {
      console.log("No doctor email available yet");
      return;
    }
    
    try {
      setPatientsLoading(true);
      setError("");
      console.log("Fetching patients for doctor:", doctorEmail);
      const response = await axios.post(
        `${BASE_URL}/doctor/patients`, 
        { email: doctorEmail },
        { headers: { "Authorization": `Bearer ${token}` } }
      );
      setPatients(response.data || []);
    } catch (error) {
      console.error("Error fetching assigned patients:", error);
      setError(error.response?.status === 401 ? 
        "Authentication failed. Please login again." : 
        "Failed to load patients."
      );
    } finally {
      setPatientsLoading(false);
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && doctorEmail && userRole === "doctor") {
      getPatients();
    } else if (token && doctorEmail && userRole && userRole !== "doctor") {
      setError("Access denied. Doctor role required.");
      setLoading(false);
    }
  }, [token, doctorEmail, userRole]);

  const onRefresh = () => {
    setRefreshing(true);
    getPatients();
  };

  const handleBackToPatients = () => {
    setSelectedPatientId(null);
    setFlapData([]);
    setError("");
  };

  const handleFetchFlapData = async (patientId) => {
    console.log("Fetching flap data for patient:", patientId);
    setSelectedPatientId(patientId);
    setFlapData([]);
    setFlapLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `${BASE_URL}/flap/search/${patientId}`,
        { headers: { "Authorization": `Bearer ${token}` } }
      );
      
      console.log("Flap data response:", response.data);
      console.log("Response status:", response.status);
      
      // FIX: The API returns data in response.data.records, not response.data.data
      const flapRecords = response.data.records || [];
      
      console.log("Processed flap records:", flapRecords);
      
      setFlapData(flapRecords);
      
      if (flapRecords.length === 0) {
        console.log("No flap records found for this patient");
      }
      
    } catch (error) {
      console.error("Error fetching flap data:", error);
      console.error("Error response:", error.response);
      
      if (error.response?.status === 404) {
        const errorMessage = error.response?.data?.error || error.response?.data?.message || "";
        console.log("404 Error message:", errorMessage);
        
        if (errorMessage.toLowerCase().includes("no flap data found") || 
            errorMessage.toLowerCase().includes("not found")) {
          setFlapData([]);
          setError("");
        } else {
          setError("Endpoint not found. Please contact support.");
        }
      } else if (error.response?.status === 401) {
        setError("Authentication failed. Please login again.");
      } else {
        setError(`Failed to load flap data: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setFlapLoading(false);
    }
  };

  const formatDoctorName = (name) => {
    if (!name) return "Doctor";
    
    // If name looks like an email, extract the part before @
    if (name.includes('@')) {
      return name.split('@')[0];
    }
    
    // Return the name as stored (assuming it's already properly formatted)
    return name;
  };

  const getDoctorDisplayName = () => {
    if (!doctorName) return "Doctor";
    
    // If the stored name is just an email, use the email prefix
    if (doctorName.includes('@')) {
      return doctorName.split('@')[0];
    }
    
    // If we have a proper name, use it as is
    return doctorName;
  };

  return (
    <View style={styles.container}>
      {selectedPatientId && (
        <TouchableOpacity
          style={styles.topBackButton}
          onPress={handleBackToPatients}
        >
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
      )}
      
      <Text style={styles.header}>Doctor Dashboard</Text>
      <Text style={styles.subHeader}>Welcome, Dr. {getDoctorDisplayName()}!</Text>

      {!token || !doctorEmail || !userRole ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Authentication required. Please login first.</Text>
        </View>
      ) : userRole !== "doctor" ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Access denied. Doctor role required.</Text>
        </View>
      ) : loading ? (
        <ActivityIndicator size="large" color="#10e0f8" />
      ) : (
        <View style={styles.content}>

          <View style={styles.patientsHeader}>
            <Text style={styles.sectionTitle}>Your Assigned Patients</Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={onRefresh}
              disabled={refreshing}
            >
              <Ionicons 
                name="refresh" 
                size={20} 
                color="#10e0f8" 
              />
            </TouchableOpacity>
          </View>

          {patientsLoading ? (
            <ActivityIndicator size="large" color="#10e0f8" />
          ) : error && !patients.length ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : patients.length === 0 ? (
            <Text style={styles.infoText}>No patients assigned yet.</Text>
          ) : (
            <FlatList
              data={patients}
              keyExtractor={(item) => item._id}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <Text style={styles.cardText}>
                    <Text style={styles.boldText}>Name:</Text> {item.name ?? "N/A"}
                  </Text>
                  <Text style={styles.cardText}>
                    <Text style={styles.boldText}>Age:</Text> {item.age ?? "N/A"}
                  </Text>
                  <Text style={styles.cardText}>
                    <Text style={styles.boldText}>Contact:</Text> {item.contact ?? "N/A"}
                  </Text>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => handleFetchFlapData(item._id)}
                  >
                    <Text style={styles.buttonText}>Search Flap Data</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          )}

          {selectedPatientId && (
            <View style={styles.flapContainer}>
              <Text style={styles.sectionTitle}>Flap Monitoring Data</Text>
              {flapLoading ? (
                <ActivityIndicator size="large" color="#10e0f8" />
              ) : error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : flapData.length > 0 ? (
                <FlatList
                  data={flapData}
                  keyExtractor={(item) => item._id}
                  renderItem={({ item }) => (
                    <View style={styles.flapCard}>
                      <Text style={styles.cardText}>
                        <Text style={styles.boldText}>Temperature:</Text> {item.temperature?.toFixed(2) ?? "N/A"} °C
                      </Text>
                      <Text style={styles.cardText}>
                        <Text style={styles.boldText}>Timestamp:</Text> {item.timestamp ? new Date(item.timestamp).toLocaleString() : "N/A"}
                      </Text>
                      {item.image_url && (
                        <View style={styles.imageContainer}>
                          <Text style={styles.boldText}>Flap Image:</Text>
                          <Image 
                            source={{ uri: item.image_url }}
                            style={styles.flapImage}
                            resizeMode="contain"
                            onError={(error) => console.log('Image load error:', error)}
                          />
                        </View>
                      )}
                    </View>
                  )}
                />
              ) : (
                <Text style={styles.cardText}>No flap data available for this patient.</Text>
              )}
            </View>
          )}
        </View>
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
  content: {
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 60,
    textAlign: "center",
  },
  subHeader: {
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  topBackButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 1000,
    backgroundColor: 'rgba(16, 224, 248, 0.2)',
    borderRadius: 50,
    padding: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  patientsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  refreshButton: {
    padding: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#10e0f8",
    marginBottom: 10,
  },
  infoText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  card: {
    backgroundColor: "#2c3e50",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  flapContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#34495e",
    borderRadius: 8,
  },
  flapCard: {
    backgroundColor: "#3d566e",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  cardText: {
    color: "#fff",
    fontSize: 16,
  },
  boldText: {
    fontWeight: "bold",
    color: "#10e0f8",
  },
  button: {
    marginTop: 10,
    backgroundColor: "#5db5c7",
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    marginTop: 10,
  },
  flapImage: {
    width: '100%',
    height: 200,
    marginTop: 5,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
});