#include <MD_Parola.h>
#include <MD_MAX72XX.h>
#include <SPI.h>
#include <DHT.h>

#define HARDWARE_TYPE MD_MAX72XX::FC16_HW
#define MAX_DEVICES 4
#define CS_PIN 10
#define DHTPIN 2
#define DHTTYPE DHT22

MD_Parola myDisplay = MD_Parola(HARDWARE_TYPE, CS_PIN, MAX_DEVICES);
DHT dht(DHTPIN, DHTTYPE);

float temp = 0;
float hum = 0;
bool showTemp = true;

void setup() {
  myDisplay.begin();
  myDisplay.setIntensity(0);
  dht.begin();
  delay(1000);
}

void loop() {
  temp = dht.readTemperature();
  hum = dht.readHumidity();
  
  if (myDisplay.displayAnimate()) {
    if (showTemp) {
      char str[20];
      sprintf(str, "%.1f C", temp);
      myDisplay.displayText(str, PA_LEFT, 0, 0, PA_SCROLL_LEFT, PA_SCROLL_UP);
    } else {
      char str[20];
      sprintf(str, "%.1f%%", hum);
      myDisplay.displayText(str, PA_LEFT, 0, 0, PA_SCROLL_UP, PA_SCROLL_LEFT);
    }
  }
  
  delay(5000);
  showTemp = !showTemp;
  myDisplay.displayClear();
}

