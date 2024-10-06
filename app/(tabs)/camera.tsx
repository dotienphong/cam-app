import PhotoPreviewSection from "@/components/PhotoPreviewSection";
import { AntDesign } from "@expo/vector-icons";
import axios from "axios";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState, useEffect } from "react";
import {
  Alert,
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Camera() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const [timerCapture, setTimerCapture] = useState(15000); // Interval capture timer
  const [isAutoCapture, setIsAutoCapture] = useState<any>("pause"); // Play/Pause state
  const intervalId = useRef<any>(null); // Ref to store interval ID

  // Request camera permissions
  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
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
      };
      const takedPhoto = await cameraRef.current.takePictureAsync(options);

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

        // Send the image to the server
        const response = await axios.post(
          "https://cc8e-2402-800-63b8-8094-980c-b1a7-fa87-a765.ngrok-free.app/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        );

        // Handle response
        console.log("Response: ", response.data.Result);
        if (response.data.Result) {
          Alert.alert(response.data.Result);
        }
      } catch (error) {
        console.log("Error uploading image: ", error);
        alert("Upload failed. There was an error uploading the image.");
      }
    }
  };

  // Handle play/pause auto-capture
  const handleSetAutoCapture = () => {
    if (isAutoCapture === "pause") {
      setIsAutoCapture("play");
      // Start interval for auto-capture
      intervalId.current = setInterval(() => {
        handleTakePhoto();
      }, timerCapture);
    } else if (isAutoCapture === "play") {
      setIsAutoCapture("pause");
      // Clear interval to stop auto-capture
      clearInterval(intervalId.current);
      intervalId.current = null;
    }
  };

  // Handle increasing capture timer
  const handleTimerCaptureUp = () => {
    setTimerCapture((prevTimer) => {
      const newTimer = prevTimer + 1000;
      if (isAutoCapture === "play") {
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
    if (timerCapture > 2000) {
      setTimerCapture((prevTimer) => {
        const newTimer = prevTimer - 1000;
        if (isAutoCapture === "play") {
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
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <AntDesign name="retweet" size={44} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleTakePhoto}>
            <AntDesign name="camera" size={44} color="black" />
          </TouchableOpacity>
        </View>

        <Text style={{ textAlign: "center", fontSize: 20, color: "red" }}>
          Timer: {timerCapture / 1000}s
        </Text>
        <View style={styles.buttonContainer2}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleTimerCaptureDown}
          >
            <AntDesign name="minus" size={44} color="black" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={handleSetAutoCapture}
          >
            <AntDesign name={isAutoCapture} size={44} color="black" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={handleTimerCaptureUp}
          >
            <AntDesign name="plus" size={44} color="black" />
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
    marginLeft: 50,
    marginRight: 50,
    marginBottom: 10,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
    marginHorizontal: 10,
    backgroundColor: "gray",
    borderRadius: 10,
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
});
