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
  const [timerCapture, setTimerCapture] = useState<number>(15000); // Interval capture timer
  const [isAutoCapture, setIsAutoCapture] = useState<any>("play"); // Play/Pause state
  const intervalId = useRef<any>(null);
  const [result, setResult] = useState<string | null>(null);

  // const URL_API_SENT_IMAGE =
  //   "https://cc8e-2402-800-63b8-8094-980c-b1a7-fa87-a765.ngrok-free.app/upload";
  const URL_API_SENT_IMAGE = "http://weblearn.ddns.net:4004/upload";

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
        const response = await axios.post(URL_API_SENT_IMAGE, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        // Handle response
        console.log("Response: ", response.data.Result);
        if (response.data.Result) {
          setResult(response.data.Result);
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
    if (timerCapture > 2000) {
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
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <AntDesign name="retweet" size={44} color="yellow" />
          </TouchableOpacity>
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
            style={{ ...styles.button, backgroundColor: "rgb(143, 253, 171)" }}
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
              {isAutoCapture}
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
      {<Text style={styles.resultText}>{result || "Result"}</Text>}
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
    fontWeight: "bold",
    fontSize: 22,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
});
