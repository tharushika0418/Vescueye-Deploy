// import React, { useState, useEffect } from "react";
// import { 
//   View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, RefreshControl 
// } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import { Ionicons } from "@expo/vector-icons";
// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// export default function DoctorDashboard() {
//   const [patients, setPatients] = useState([]);
//   const [selectedPatientId, setSelectedPatientId] = useState(null);
//   const [flapData, setFlapData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [flapLoading, setFlapLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [refreshing, setRefreshing] = useState(false);
//   const [token, setToken] = useState("");

//   const navigation = useNavigation();
//   const doctorEmail = "doctor@test.com";
//   const BASE_URL = "http:// 172.20.10.6:5001/api/users";

//   useEffect(() => {
//     const getToken = async () => {
//       try {
//         const storedToken = await AsyncStorage.getItem("userToken");
//         if (storedToken) {
//           setToken(storedToken);
//         }
//       } catch (error) {
//         console.error("Error retrieving token:", error);
//       }
//     };
    
//     getToken();
//   }, []);

//   const getPatients = async () => {
//     try {
//       setError("");
//       const response = await axios.post(
//         `${BASE_URL}/doctor/patients`, 
//         { email: doctorEmail },
//         { headers: { "Authorization": `Bearer ${token}` } }
//       );
//       setPatients(response.data || []);
//     } catch (error) {
//       console.error("Error fetching assigned patients:", error);
//       setError(error.response?.status === 401 ? 
//         "Authentication failed. Please login again." : 
//         "Failed to load patients."
//       );
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useEffect(() => {
//     if (token) {
//       getPatients();
//     }
//   }, [token]);

//   const onRefresh = () => {
//     setRefreshing(true);
//     getPatients();
//   };

//   const handleFetchFlapData = async (patientId) => {
//     setSelectedPatientId(patientId);
//     setFlapData([]);
//     setFlapLoading(true);
//     setError("");

//     try {
//       const response = await axios.get(
//         `${BASE_URL}/flap/search/${patientId}`,
//         { headers: { "Authorization": `Bearer ${token}` } }
//       );
//       setFlapData(response.data || []);
//     } catch (error) {
//       console.error("Error fetching flap data:", error);
//       setError(error.response?.status === 401 ?
//         "Authentication failed. Please login again." :
//         "Failed to load flap data."
//       );
//     } finally {
//       setFlapLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
      

//       <Text style={styles.header}>Doctor Dashboard</Text>
//       <Text style={styles.subHeader}>Welcome, Doctor!</Text>

//       {!token ? (
//         <View style={styles.errorContainer}>
//           <Text style={styles.errorText}>Authentication required. Please login first.</Text>
//         </View>
//       ) : loading ? (
//         <ActivityIndicator size="large" color="#10e0f8" />
//       ) : error && !patients.length ? (
//         <Text style={styles.errorText}>{error}</Text>
//       ) : patients.length === 0 ? (
//         <Text style={styles.infoText}>No patients assigned yet.</Text>
//       ) : (
//         <FlatList
//           data={patients}
//           keyExtractor={(item) => item._id}
//           refreshControl={
//             <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//           }
//           renderItem={({ item }) => (
//             <View style={styles.card}>
//               <Text style={styles.cardText}>
//                 <Text style={styles.boldText}>Name:</Text> {item.name ?? "N/A"}
//               </Text>
//               <Text style={styles.cardText}>
//                 <Text style={styles.boldText}>Age:</Text> {item.age ?? "N/A"}
//               </Text>
//               <Text style={styles.cardText}>
//                 <Text style={styles.boldText}>Contact:</Text> {item.contact ?? "N/A"}
//               </Text>
//               <TouchableOpacity
//                 style={styles.button}
//                 onPress={() => handleFetchFlapData(item._id)}
//               >
//                 <Text style={styles.buttonText}>Search Flap Data</Text>
//               </TouchableOpacity>
//             </View>
//           )}
//         />
//       )}

//       {selectedPatientId && (
//         <View style={styles.flapContainer}>
//           <Text style={styles.sectionTitle}>Flap Data</Text>
//           {flapLoading ? (
//             <ActivityIndicator size="large" color="#10e0f8" />
//           ) : error ? (
//             <Text style={styles.errorText}>{error}</Text>
//           ) : flapData.length > 0 ? (
//             <FlatList
//               data={flapData}
//               keyExtractor={(item) => item._id}
//               renderItem={({ item }) => (
//                 <View style={styles.flapCard}>
//                   <Text style={styles.cardText}>
//                     <Text style={styles.boldText}>Temperature:</Text> {item.temperature?.toFixed(2) ?? "N/A"} °C
//                   </Text>
//                   <Text style={styles.cardText}>
//                     <Text style={styles.boldText}>Timestamp:</Text> {item.timestamp ? new Date(item.timestamp).toLocaleString() : "N/A"}
//                   </Text>
//                 </View>
//               )}
//             />
//           ) : (
//             <Text style={styles.cardText}>No flap data available.</Text>
//           )}
//         </View>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: "#465a6e",
//   },
//   backButton: {
//     position: 'absolute',
//     top: 40,
//     left: 16,
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     borderRadius: 30,
//     padding: 8,
//     zIndex: 1,
//   },
//   header: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#fff",
//     marginTop: 60,
//     textAlign: "center",
//   },
//   subHeader: {
//     fontSize: 18,
//     color: "#fff",
//     textAlign: "center",
//     marginBottom: 20,
//   },
//   infoText: {
//     color: "#fff",
//     fontSize: 16,
//     textAlign: "center",
//     marginTop: 20,
//   },
//   card: {
//     backgroundColor: "#2c3e50",
//     padding: 15,
//     borderRadius: 8,
//     marginBottom: 10,
//   },
//   flapContainer: {
//     marginTop: 20,
//     padding: 10,
//     backgroundColor: "#34495e",
//     borderRadius: 8,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#10e0f8",
//     marginBottom: 10,
//   },
//   flapCard: {
//     backgroundColor: "#3d566e",
//     padding: 15,
//     borderRadius: 8,
//     marginBottom: 10,
//   },
//   cardText: {
//     color: "#fff",
//     fontSize: 16,
//   },
//   boldText: {
//     fontWeight: "bold",
//     color: "#10e0f8",
//   },
//   button: {
//     marginTop: 10,
//     backgroundColor: "#5db5c7",
//     paddingVertical: 10,
//     borderRadius: 6,
//     alignItems: "center",
//   },
//   buttonText: {
//     color: "#000",
//     fontWeight: "bold",
//     fontSize: 16,
//   },
//   errorText: {
//     color: "red",
//     fontSize: 16,
//     textAlign: "center",
//     marginTop: 10,
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   }
// });
import React, { useState, useEffect } from "react";
import { 
  View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, RefreshControl 
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
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [token, setToken] = useState("");

  const navigation = useNavigation();
  const doctorEmail = "doctor@test.com";
  const BASE_URL = "http://172.20.10.6:5001/api/users";

  useEffect(() => {
    const getToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("userToken");
        if (storedToken) {
          setToken(storedToken);
        }
      } catch (error) {
        console.error("Error retrieving token:", error);
      }
    };
    
    getToken();
  }, []);

  const getPatients = async () => {
    try {
      setError("");
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
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      getPatients();
    }
  }, [token]);

  const onRefresh = () => {
    setRefreshing(true);
    getPatients();
  };

const handleFetchFlapData = async (patientId) => {
  setSelectedPatientId(patientId);
  setFlapData([]);
  setFlapLoading(true);
  setError("");

  try {
    const response = await axios.get(
      `${BASE_URL}/flap/search/${patientId}`,
      { headers: { "Authorization": `Bearer ${token}` } }
    );
    setFlapData(response.data || []);
  } catch (error) {
    console.error("Error fetching flap data:", error);
    
    // Handle the specific case where no flap data is found (404 with specific message)
    if (error.response?.status === 404) {
      // Check if it's the "no data found" message
      const errorMessage = error.response?.data?.error || error.response?.data?.message || "";
      if (errorMessage.toLowerCase().includes("no flap data found") || 
          errorMessage.toLowerCase().includes("not found")) {
        // This is expected - patient has no flap data yet
        setFlapData([]);
        setError(""); // Don't show this as an error
      } else {
        // This is a real 404 error (endpoint not found)
        setError("Endpoint not found. Please contact support.");
      }
    } else if (error.response?.status === 401) {
      setError("Authentication failed. Please login again.");
    } else {
      // Handle other errors
      setError("Failed to load flap data. Please try again.");
    }
  } finally {
    setFlapLoading(false);
  }
};

  return (
    <View style={styles.container}>
      

      <Text style={styles.header}>Doctor Dashboard</Text>
      <Text style={styles.subHeader}>Welcome, Doctor!</Text>

      {!token ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Authentication required. Please login first.</Text>
        </View>
      ) : loading ? (
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
          <Text style={styles.sectionTitle}>Flap Data</Text>
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
                </View>
              )}
            />
          ) : (
            <Text style={styles.cardText}>No flap data available.</Text>
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
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 30,
    padding: 8,
    zIndex: 1,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#10e0f8",
    marginBottom: 10,
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
  }
});
