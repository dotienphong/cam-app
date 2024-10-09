import PhotoPreviewSection from "@/components/PhotoPreviewSection";
import { AntDesign } from "@expo/vector-icons";
import axios from "axios";
import {
  CameraType,
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
} from "expo-camera";
import * as Notifications from "expo-notifications";
import { useRef, useState, useEffect } from "react";
import {
  Alert,
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useBatteryLevel } from "expo-battery";
import { TextInput } from "react-native";
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function Camera() {
  const batteryLevel = useBatteryLevel();
  const [facing, setFacing] = useState<CameraType>("back");
  const [isLoading, setIsLoading] = useState(false);
  const [permissionVideo, requestPermissionVideo] = useCameraPermissions();
  const [permissionAudio, requestPermissionAudio] = useMicrophonePermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const [timerCapture, setTimerCapture] = useState<number>(15000); // Interval capture timer
  const [isAutoCapture, setIsAutoCapture] = useState<any>("play"); // Play/Pause state
  const intervalId = useRef<any>(null);
  const [result, setResult] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");

  const URL_API_SENT_IMAGE =
    inputValue == ""
      ? "https://9f72-2402-800-63b8-a89b-f9d9-b8d3-8202-ddd9.ngrok-free.app/upload"
      : inputValue;
  // const URL_API_SENT_IMAGE = "http://weblearn.ddns.net:4004/upload";

  // Request camera permissions
  if (!permissionVideo) {
    return <View />;
  }

  if (!permissionAudio) {
    return <View />;
  }

  if (!permissionVideo.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to show the camera
        </Text>
        <Button
          onPress={requestPermissionVideo}
          title="grant permission Video"
        />
      </View>
    );
  }
  if (!permissionAudio.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to use the Audio
        </Text>
        <Button
          onPress={requestPermissionAudio}
          title="grant permission Audio"
        />
      </View>
    );
  }

  // Toggle camera direction
  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  const handleSubmit = () => {
    if (inputValue == "") {
      Alert.alert("Using default API");
    } else {
      Alert.alert("Using the new API:", inputValue);
    }
  };

  // Take a photo
  const handleTakePhoto = async () => {
    if (cameraRef.current) {
      const options = {
        quality: 1,
        base64: true,
        exif: false,
        muted: true,
      };
      const takedPhoto: any = await cameraRef.current.takePictureAsync(options);

      try {
        if (!takedPhoto) {
          alert("NO photo to upload ");
          return;
        }

        // Create form data to send the image
        const formData: any = new FormData();
        formData.append("image", {
          uri: takedPhoto.uri,
          type: "image/jpeg",
          name: "captured_image.jpg",
        });

        setIsLoading(true);

        // Send the image to the server
        const response = await axios.post(URL_API_SENT_IMAGE, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            "Access-Control-Allow-Origin": "*",
          },
        });

        // Handle response
        console.log("Response result: ", response.data.Result);

        if (response.data.Result) {
          setResult("Result: " + response.data.Result);

          // await Notifications.scheduleNotificationAsync({
          //   content: {
          //     title: "Data from server EnglishScore API",
          //     body: response.data.Result,
          //     data: {
          //       data: response.data.Result,
          //     },
          //   },
          //   trigger: { seconds: 1 },
          // });
        }
      } catch (error) {
        console.log("Error uploading image: ", error);
        alert("Upload failed. There was an error uploading the image.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRemoveResult = () => {
    setResult(null);
  };

  // Handle play/pause auto-capture
  const handleSetAutoCapture = () => {
    if (isAutoCapture === "pause") {
      clearInterval(intervalId.current);
      intervalId.current = null;
      setIsAutoCapture("play");
    } else if (isAutoCapture === "play") {
      // Trigger the photo capture immediately before starting the interval
      handleTakePhoto();
      intervalId.current = setInterval(() => {
        handleTakePhoto();
      }, timerCapture);
      setIsAutoCapture("pause");
    }
  };

  // Handle increasing capture timer
  const handleTimerCaptureUp = () => {
    setTimerCapture((prevTimer) => {
      const newTimer = prevTimer + 1000;
      if (isAutoCapture === "pause") {
        // Clear and restart interval if auto-capture is active
        clearInterval(intervalId.current);
        intervalId.current = setInterval(() => {
          handleTakePhoto();
        }, newTimer);
      }
      return newTimer;
    });
  };

  // Handle decreasing capture timer
  const handleTimerCaptureDown = () => {
    if (timerCapture > 10000) {
      setTimerCapture((prevTimer) => {
        const newTimer = prevTimer - 1000;
        if (isAutoCapture === "pause") {
          // Clear and restart interval if auto-capture is active
          clearInterval(intervalId.current);
          intervalId.current = setInterval(() => {
            handleTakePhoto();
          }, newTimer);
        }
        return newTimer;
      });
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        onChangeText={setInputValue}
        value={inputValue}
        placeholder="Input API backend URL"
        placeholderTextColor="white"
        keyboardType="default"
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
      />

      <CameraView
        style={styles.camera}
        onCameraReady={() => console.log("Camera is ready")}
        facing={facing}
        ref={cameraRef}
        autofocus="on"
        videoQuality="1080p"
        mute={true}
      >
        <Text style={styles.resultText}>{result !== null && result}</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <AntDesign name="retweet" size={44} color="yellow" />
          </TouchableOpacity>

          {isLoading ? (
            <ActivityIndicator
              size="large"
              color="red"
              style={{ marginTop: 50 }}
            />
          ) : (
            <TouchableOpacity
              style={{ ...styles.button, backgroundColor: "orange" }}
              onPress={handleTakePhoto}
            >
              <Text
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: 15,
                  color: "red",
                }}
              >
                Take Photo
              </Text>
              <AntDesign name="camera" size={44} color="yellow" />
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.button} onPress={handleRemoveResult}>
            <AntDesign name="delete" size={44} color="yellow" />
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer2}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleTimerCaptureDown}
          >
            <AntDesign name="minus" size={44} color="yellow" />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ ...styles.button, backgroundColor: "rgb(100, 253, 171)" }}
            onPress={handleSetAutoCapture}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                fontSize: 18,
                color: "red",
              }}
            >
              {timerCapture / 1000}s
            </Text>
            <AntDesign
              name={isAutoCapture}
              size={44}
              color={isAutoCapture === "play" ? "blue" : "red"}
            />
            <Text style={{ color: "blue", fontWeight: "bold", fontSize: 16 }}>
              {"Auto Capture"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={handleTimerCaptureUp}
          >
            <AntDesign name="plus" size={44} color="yellow" />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  input: {
    textAlign: "center",
    fontSize: 15,
    color: "yellow",
    backgroundColor: "purple",
    borderColor: "white",
    height: 40,
    marginTop: 40,
    marginBottom: 10,
    marginLeft: 15,
    marginRight: 15,
    borderWidth: 2,
    padding: 10,
  },
  camera: {
    flex: 1,
  },
  battery: {},
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    marginLeft: 50,
    marginRight: 50,
  },
  buttonContainer2: {
    flexDirection: "row",
    backgroundColor: "transparent",
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
    marginHorizontal: 8,
    backgroundColor: "transparent",
    justifyContent: "center",
    borderStyle: "solid",
    borderWidth: 2,
    borderRadius: 8,
    marginTop: 10,
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  resultText: {
    maxHeight: 400,
    color: "red",
    backgroundColor: "transparent",
    fontSize: 22,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    fontWeight: "bold",
  },
});
