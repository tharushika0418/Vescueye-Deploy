import React, { useEffect, useState } from "react";
import { 
  View, Text, FlatList, ActivityIndicator, StyleSheet, RefreshControl, Image
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "http://172.20.10.6:5001/api/users"; // Your backend URL

export default function DoctorProfile() {
  const [patients, setPatients] = useState([]);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);

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
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}
          <Text style={styles.doctorName}>Dr. {doctorInfo.name || "N/A"}</Text>
          <Text style={styles.doctorSpecialty}>{doctorInfo.specialty || "N/A"}</Text>
          <Text style={styles.doctorEmail}>{doctorInfo.email || "N/A"}</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Assigned Patients</Text>

      {patients.length === 0 ? (
        <Text style={styles.noDataText}>No patients assigned yet.</Text>
      ) : (
        <FlatList
          data={patients}
          keyExtractor={(item) => item._id || item.id || Math.random().toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <View style={styles.patientCard}>
              <Text style={styles.patientName}>{item.name || "N/A"}</Text>
              <Text>Age: {item.age ?? "N/A"}</Text>
              <Text>Gender: {item.gender || "N/A"}</Text>
              <Text>Contact: {item.contact || "N/A"}</Text>
              <Text>Address: {item.address || "N/A"}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 60,       // Padding from top for spacing
    flex: 1,
    backgroundColor: "#465a6e",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#10e0f8",
    fontSize: 14,
  },
  header: {
    marginBottom: 20,
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
  placeholderText: {
    color: "#888",
    fontSize: 14,
  },
  doctorName: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  doctorSpecialty: {
    fontSize: 20,
    color: "#a0c9e8",
    marginTop: 4,
    textAlign: "center",
  },
  doctorEmail: {
    fontSize: 18,
    color: "#8fb1cc",
    marginTop: 2,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 10,
    color: "#10e0f8",
    fontWeight: "bold",
  },
  patientCard: {
    backgroundColor: "#2c3e50",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
  },
  patientName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
    color: "#fff",
  },
  noDataText: {
    fontStyle: "italic",
    color: "#bbb",
    textAlign: "center",
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
