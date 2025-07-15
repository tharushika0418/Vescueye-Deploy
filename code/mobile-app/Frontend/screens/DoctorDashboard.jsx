import React, { useState, useEffect } from "react";
import { 
  View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, RefreshControl, Image 
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DoctorDashboard() {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [flapData, setFlapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flapLoading, setFlapLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [token, setToken] = useState("");
  const [tokenLoaded, setTokenLoaded] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState(null);

  const navigation = useNavigation();
  // const API_URL = process.env.DEPLOYED_URL || process.env.LOCALHOST ;
  const API_URL = "http://172.20.10.6:5001";
  const BASE_URL = `${API_URL}/api/users`;

  useEffect(() => {
    const initializeToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("userToken");
        console.log("Retrieved token:", storedToken ? "Token exists" : "No token found");
        if (storedToken) {
          setToken(storedToken);
        } else {
          setError("No authentication token found. Please login again.");
          setLoading(false);
        }
      } catch (error) {
        console.error("Error retrieving token:", error);
        setError("Failed to retrieve authentication token.");
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

  const getPatients = async () => {
    if (!token) {
      setError("No authentication token available.");
      setLoading(false);
      return;
    }

    try {
      setError("");
      setLoading(true);
      console.log("Making request with token:", token.substring(0, 20) + "...");
      console.log("Request URL:", `${BASE_URL}/doctors/patients`);

      const response = await axios.get(
        `${BASE_URL}/doctors/patients`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response received:", response.status);
      console.log("Response data:", response.data);

      if (response.data.success) {
        setPatients(response.data.patients || []);
        setDoctorInfo(response.data.doctorInfo);
        console.log("Patients loaded:", response.data.patients?.length || 0);
      } else {
        setError(response.data.error || "Failed to load patients");
        setPatients([]);
      }
    } catch (error) {
      console.error("Error fetching assigned patients:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);

      if (error.response?.status === 401) {
        setError("Authentication failed. Please login again.");
        await AsyncStorage.removeItem("userToken");
        setToken("");
      } else if (error.response?.status === 403) {
        setError("Access denied. Only doctors can view assigned patients.");
      } else if (error.response?.status === 404) {
        setError("Doctor profile not found. Please contact administrator.");
      } else {
        const errorMessage = error.response?.data?.error || 
                           error.response?.data?.message || 
                           "Failed to load patients.";
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
      setError("Please login again to refresh data.");
      return;
    }
    setRefreshing(true);
    getPatients();
  };

  const handleFetchFlapData = async (patientId) => {
    if (!token) {
      setError("Authentication required. Please login again.");
      return;
    }

    setSelectedPatientId(patientId);
    setFlapData([]);
    setFlapLoading(true);
    setError("");

    try {
      console.log("Fetching flap data for patient:", patientId);
      const response = await axios.get(`${BASE_URL}/flap/search/${patientId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Flap data response:", response.status);
      console.log("Flap data:", response.data);
      
      if (response.data.records) {
        setFlapData(response.data.records);
        console.log(`Loaded ${response.data.records.length} flap records`);
      } else {
        setFlapData(response.data || []);
      }
      setError(""); // Clear any flap error on success
    } catch (error) {
      console.error("Error fetching flap data:", error);
      console.error("Flap error response:", error.response?.data);

      if (error.response?.status === 404) {
        const errorMessage = (error.response?.data?.error || error.response?.data?.message || "").toLowerCase();
        if (
          errorMessage.includes("no flap data found") ||
          errorMessage.includes("not found")
        ) {
          setFlapData([]);
          setError("");
        } else {
          setError("Patient or flap data not found.");
        }
      } else if (error.response?.status === 401) {
        setError("Authentication failed. Please login again.");
        await AsyncStorage.removeItem("userToken");
        setToken("");
      } else {
        setError(error.response?.data?.error || 
                error.response?.data?.message || 
                "Failed to load flap data. Please try again.");
      }
    } finally {
      setFlapLoading(false);
    }
  };

  const clearFlapData = () => {
    setSelectedPatientId(null);
    setFlapData([]);
    setError("");
  };

  if (!tokenLoaded) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#10e0f8" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!token) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Doctor Dashboard</Text>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Authentication required. Please login first.</Text>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Login")}>
            <Text style={styles.buttonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Doctor Dashboard</Text>
      {doctorInfo && (
        <View style={styles.doctorInfoContainer}>
          <Text style={styles.doctorInfoText}>Welcome, Dr. {doctorInfo.name}!</Text>
          <Text style={styles.doctorInfoSubText}>{doctorInfo.specialty}</Text>
        </View>
      )}

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#10e0f8" />
          <Text style={styles.loadingText}>Loading patients...</Text>
        </View>
      ) : error && !patients.length ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.button} onPress={() => getPatients()}>
            <Text style={styles.buttonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : patients.length === 0 ? (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>No patients assigned to you yet.</Text>
          <TouchableOpacity style={styles.button} onPress={() => getPatients()}>
            <Text style={styles.buttonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={styles.patientCount}>
            Assigned Patients: {patients.length}
          </Text>
          <FlatList
            data={patients}
            keyExtractor={(item, index) => item._id || index.toString()}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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
                <Text style={styles.cardText}>
                  <Text style={styles.boldText}>Gender:</Text> {item.gender ?? "N/A"}
                </Text>
                {item.medicalHistory && (
                  <Text style={styles.cardText}>
                    <Text style={styles.boldText}>Medical History:</Text> {item.medicalHistory}
                  </Text>
                )}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity 
                    style={styles.button} 
                    onPress={() => handleFetchFlapData(item._id)}
                  >
                    <Text style={styles.buttonText}>View Flap Data</Text>
                  </TouchableOpacity>
                  {selectedPatientId === item._id && (
                    <TouchableOpacity 
                      style={[styles.button, styles.clearButton]} 
                      onPress={clearFlapData}
                    >
                      <Text style={styles.buttonText}>Clear</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          />
        </>
      )}

      {selectedPatientId && (
        <View style={styles.flapContainer}>
          <Text style={styles.sectionTitle}>
            Flap Data {flapData.length > 0 && `(${flapData.length} records)`}
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
                style={styles.button} 
                onPress={() => handleFetchFlapData(selectedPatientId)}
              >
                <Text style={styles.buttonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : flapData.length > 0 ? (
            <FlatList
              data={flapData}
              keyExtractor={(item, index) => item._id || index.toString()}
              renderItem={({ item }) => (
                <View style={styles.flapCard}>
                  <Text style={styles.cardText}>
                    <Text style={styles.boldText}>Temperature:</Text> {
                      item.temperature != null ? `${item.temperature.toFixed(2)}°C` : "N/A"
                    }
                  </Text>
                  <Text style={styles.cardText}>
                    <Text style={styles.boldText}>Time:</Text> {
                      item.timestamp ? new Date(item.timestamp).toLocaleString() : "N/A"
                    }
                  </Text>
                  {item.patient_id && item.patient_id.name && (
                    <Text style={styles.cardText}>
                      <Text style={styles.boldText}>Patient:</Text> {item.patient_id.name}
                    </Text>
                  )}
                  {item.image_url ? (
                    <View style={styles.imageContainer}>
                      <Image
                        source={{ uri: item.image_url }}
                        style={styles.flapImage}
                        resizeMode="contain"
                        onError={(error) => {
                          console.log("Failed to load flap image for record:", item._id);
                          console.log("Image URL:", item.image_url);
                          console.log("Error:", error.nativeEvent.error);
                        }}
                        onLoad={() => console.log("Image loaded successfully for record:", item._id)}
                      />
                    </View>
                  ) : (
                    <Text style={styles.noImageText}>No image available</Text>
                  )}
                </View>
              )}
              style={styles.flapList}
            />
          ) : (
            <Text style={styles.noDataText}>No flap data available for this patient.</Text>
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
  doctorInfoContainer: {
    backgroundColor: "#34495e",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: "center",
  },
  doctorInfoText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#f0f0f0",
  },
  doctorInfoSubText: {
    fontSize: 14,
    color: "#a0a0a0",
  },
  patientCount: {
    color: "#e1e1e1",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
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
  },
  flapCard: {
    backgroundColor: "#34495e",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    color: "#eee",
    marginBottom: 3,
  },
  boldText: {
    fontWeight: "bold",
    color: "#10e0f8",
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  button: {
    backgroundColor: "#10e0f8",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
  },
  clearButton: {
    backgroundColor: "#e74c3c",
  },
  buttonText: {
    color: "#0d0d0d",
    fontWeight: "bold",
  },
  flapContainer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#10e0f8",
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#10e0f8",
    marginBottom: 10,
  },
  flapList: {
    maxHeight: 300,
  },
  imageContainer: {
    marginTop: 10,
    alignItems: "center",
    backgroundColor: "#2c3e50",
    borderRadius: 8,
    padding: 8,
  },
  flapImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  noDataText: {
    color: "#bbb",
    fontStyle: "italic",
    fontSize: 14,
    marginTop: 5,
  },
  noImageText: {
    color: "#aaa",
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 5,
    textAlign: "center",
  },
  loadingText: {
    color: "#10e0f8",
    marginTop: 8,
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: "#ff4d4d",
    padding: 12,
    borderRadius: 8,
    marginVertical: 20,
  },
  flapErrorContainer: {
    backgroundColor: "#ff6666",
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
  },
  errorText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  infoContainer: {
    marginTop: 40,
    alignItems: "center",
  },
  infoText: {
    color: "#eee",
    fontSize: 16,
    marginBottom: 15,
  },
});
