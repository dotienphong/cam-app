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

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function Camera() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [isLoading, setIsLoading] = useState(false);
  const [permissionVideo, requestPermissionVideo] = useCameraPermissions();
  const [permissionAudio, requestPermissionAudio] = useMicrophonePermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const [timerCapture, setTimerCapture] = useState<number>(15000); // Interval capture timer
  const [isAutoCapture, setIsAutoCapture] = useState<any>("play"); // Play/Pause state
  const intervalId = useRef<any>(null);
  const [result, setResult] = useState<string | null>("Result here");

  const URL_API_SENT_IMAGE =
    "https://cc8e-2402-800-63b8-8094-980c-b1a7-fa87-a765.ngrok-free.app/upload";
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
          alert("No photo to upload");
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
        console.log("Response: ", response.data.Result);

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

        // Clear result after 8 seconds
        setTimeout(() => {
          setResult("Result here");
        }, 8000);
      } catch (error) {
        console.log("Error uploading image: ", error);
        alert("Upload failed. There was an error uploading the image.");
      } finally {
        // Set loading state to false after the request completes or fails
        setIsLoading(false);
      }
    }
  };

  // Handle play/pause auto-capture
  const handleSetAutoCapture = () => {
    if (isAutoCapture === "pause") {
      setIsAutoCapture("play");
      // Clear interval to stop auto-capture
      clearInterval(intervalId.current);
      intervalId.current = null;
    } else if (isAutoCapture === "play") {
      setIsAutoCapture("pause");
      // Start interval for auto-capture
      intervalId.current = setInterval(() => {
        handleTakePhoto();
      }, timerCapture);
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
      <CameraView
        style={styles.camera}
        onCameraReady={() => console.log("Camera is ready")}
        facing={facing}
        ref={cameraRef}
        autofocus="on"
        mute={true}
        videoQuality="1080p"
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <AntDesign name="retweet" size={44} color="yellow" />
          </TouchableOpacity>
          {isLoading ? (
            <ActivityIndicator
              size="large"
              color="red"
              style={{ margin: 10 }}
            />
          ) : null}
          <TouchableOpacity style={styles.button} onPress={handleTakePhoto}>
            <AntDesign name="camera" size={44} color="yellow" />
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

      <Text style={styles.resultText}>{result}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  camera: {
    flex: 1,
  },
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
  },
});
