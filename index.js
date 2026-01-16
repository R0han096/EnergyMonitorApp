import axios from 'axios';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ProgressChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get("window").width;

// --- CONFIGURATION ---
const THINGSBOARD_URL = 'https://thingsboard.cloud';
const ACCESS_TOKEN = 'n4JEQTGFafATP2mQnZPz'; 
const API_ENDPOINT = `${THINGSBOARD_URL}/api/v1/${ACCESS_TOKEN}/attributes?clientKeys=voltage,power`;

const POWER_THRESHOLD = 5000; 
const COST_PER_100W = 10; // 10 Rupees per 100W as requested

export default function HomeScreen() {
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(API_ENDPOINT);
        setData(response.data || {}); 
        setIsLoading(false);
      } catch (err) {
        setError(err);
        setIsLoading(false);
      }
    };
    fetchData(); 
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId); 
  }, []); 

  // Data Extraction
  const currentPower = data?.power?.[0]?.value || 0;
  const currentVoltage = data?.voltage?.[0]?.value || 0;
  
  // Cost Calculation: (Power / 100) * 10 Rupees
  const estimatedCost = ((currentPower / 100) * COST_PER_100W).toFixed(2);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#00FF00" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ alignItems: 'center', paddingBottom: 50 }}>
      <Text style={styles.headerTitle}>Energy Dashboard</Text>

      {/* --- POWER GAUGE --- */}
      <View style={styles.gaugeContainer}>
        <ProgressChart
          data={{ data: [Math.min(currentPower / 8000, 1)] }} // Scaled against 8kW max
          width={screenWidth}
          height={220}
          strokeWidth={16}
          radius={85}
          chartConfig={powerChartConfig}
          hideLegend={true}
        />
        <View style={styles.gaugeTextPos}>
          <Text style={styles.gaugeValueText}>{currentPower}</Text>
          <Text style={styles.gaugeLabelText}>WATTS</Text>
        </View>
      </View>

      {/* --- VOLTAGE GAUGE --- */}
      <View style={styles.gaugeContainer}>
        <ProgressChart
          data={{ data: [Math.min(currentVoltage / 250, 1)] }} // Scaled against 250V max
          width={screenWidth}
          height={220}
          strokeWidth={16}
          radius={85}
          chartConfig={voltageChartConfig}
          hideLegend={true}
        />
        <View style={styles.gaugeTextPos}>
          <Text style={styles.gaugeValueText}>{currentVoltage}</Text>
          <Text style={styles.gaugeLabelText}>VOLTS</Text>
        </View>
      </View>

      {/* --- COST CHART (CARD STYLE) --- */}
      <View style={styles.costCard}>
        <Text style={styles.costTitle}>LIVE COST ESTIMATE</Text>
        <Text style={styles.costAmount}>₹{estimatedCost}</Text>
        <Text style={styles.costRate}>Rate: ₹{COST_PER_100W} per 100W</Text>
      </View>

      {currentPower > POWER_THRESHOLD && (
        <View style={styles.alertBanner}>
          <Text style={styles.alertText}>⚠️ OVERCONSUMPTION! ⚠️</Text>
        </View>
      )}
    </ScrollView>
  );
}

// --- STYLING & CONFIGS ---

const powerChartConfig = {
  backgroundGradientFrom: "#0F0F0F",
  backgroundGradientTo: "#0F0F0F",
  color: (opacity = 1) => `rgba(0, 255, 127, ${opacity})`, // Neon Green
};

const voltageChartConfig = {
  backgroundGradientFrom: "#0F0F0F",
  backgroundGradientTo: "#0F0F0F",
  color: (opacity = 1) => `rgba(0, 180, 255, ${opacity})`, // Electric Blue
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F0F' },
  centerContainer: { flex: 1, backgroundColor: '#0F0F0F', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#FFF', marginTop: 60, marginBottom: 10 },
  
  gaugeContainer: { justifyContent: 'center', alignItems: 'center', height: 220, marginBottom: 10 },
  gaugeTextPos: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  gaugeValueText: { color: '#FFF', fontSize: 38, fontWeight: 'bold' },
  gaugeLabelText: { color: '#888', fontSize: 12, letterSpacing: 2 },

  costCard: {
    backgroundColor: '#1A1A1A',
    width: '85%',
    padding: 25,
    borderRadius: 24,
    marginTop: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333'
  },
  costTitle: { color: '#FFD700', fontSize: 13, fontWeight: 'bold', letterSpacing: 1 },
  costAmount: { color: '#FFF', fontSize: 44, fontWeight: '900', marginVertical: 8 },
  costRate: { color: '#555', fontSize: 11 },

  alertBanner: { backgroundColor: '#FF4D4D', padding: 15, borderRadius: 12, marginTop: 20, width: '85%', alignItems: 'center' },
  alertText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});

