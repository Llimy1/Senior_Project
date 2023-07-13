#include <MD_Parola.h>
#include <MD_MAX72xx.h>
#include <SPI.h>

#define HARDWARE_TYPE MD_MAX72XX::FC16_HW
#define MAX_DEVICES 4
#define CS_PIN 3

MD_Parola myDisplay = MD_Parola(HARDWARE_TYPE, CS_PIN, MAX_DEVICES);
String output_text;
char input;

void setup() {
  Serial.begin(9600);
  myDisplay.begin();
  myDisplay.setIntensity(2);
  myDisplay.displayClear();
}
void loop() {
  if (Serial.available()) {
    input = Serial.read();
    if (input == '1') {
      output_text = "WARNING";
    } else if (input == '2') {
      output_text = "FALL";
    }
    else if (input == '3'){
      output_text = "ddddddddddd";
    }
    // if(input){
    //   output_text = input;
    // }
    myDisplay.displayClear();
    myDisplay.displayScroll(output_text.c_str(), PA_CENTER, PA_SCROLL_LEFT, 50);
  }

  if (myDisplay.displayAnimate()) {
    myDisplay.displayReset();
  }
}
