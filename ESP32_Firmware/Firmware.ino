#include <WiFi.h> // no matter how many libraries and path i create this remains as an error
#include <ThingsBoard.h> // same as above mostly these two errors are being associated with arduino.json file
// after adding an arduino library this by default turned into a TEXT file 
// --- CONFIGURATION ---
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* token = "n4JEQTGFafATP2mQnZPz"; // Your Access Token
const char* server = "thingsboard.cloud";

WiFiClient espClient;
ThingsBoard tb(espClient);

// Hardware Pins (Based on your component list)
const int voltagePin = 34; // ZMPT101B output
const int currentPin = 35; // SCT103 output

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi");
}

void loop() {
  if (!tb.connected()) {
    if (!tb.connect(server, token)) {
      Serial.println("Failed to connect to ThingsBoard");
      return;
    }
  }

  // --- SENSOR SIMULATION (Replace with actual math when hardware arrives) ---
  // For now, we generate numbers to test your App's Bar Charts
  float voltage = random(220, 240); 
  float power = random(3000, 6000); // This will trigger 'Overconsumption' in your app!

  Serial.print("Sending Power: ");
  Serial.println(power);

  // --- UPLOAD TO THINGSBOARD ---
  tb.sendTelemetryFloat("voltage", voltage);
  tb.sendTelemetryFloat("power", power);

  tb.loop();
  delay(5000); // Upload every 5 seconds to match your App's fetch interval
}