import React from "react";
import { View, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Button, Text, useTheme, Surface, IconButton } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { pickImageFromGallery, takePhotoWithCamera } from "../services/imageService";

interface ImagePickerButtonProps {
  imageUri: string | null;
  onImageSelected: (uri: string | null) => void;
}

export default function ImagePickerButton({ imageUri, onImageSelected }: ImagePickerButtonProps) {
  const theme = useTheme();

  const handleGallery = async () => {
    const uri = await pickImageFromGallery();
    if (uri) onImageSelected(uri);
  };

  const handleCamera = async () => {
    const uri = await takePhotoWithCamera();
    if (uri) onImageSelected(uri);
  };

  if (imageUri) {
    return (
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUri }} style={styles.image} />
        <View style={styles.overlay}>
          <IconButton
            icon="camera-retake"
            iconColor="#FFF"
            containerColor="rgba(0,0,0,0.5)"
            size={24}
            onPress={handleGallery}
          />
          <IconButton
            icon="delete"
            iconColor="#FFCDD2"
            containerColor="rgba(0,0,0,0.5)"
            size={24}
            onPress={() => onImageSelected(null)}
          />
        </View>
      </View>
    );
  }

  return (
    <Surface
      style={[
        styles.placeholderContainer,
        { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outline },
      ]}
      mode="flat"
    >
      <MaterialCommunityIcons name="image-plus" size={48} color={theme.colors.outline} />
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginVertical: 8 }}>
        Add a photo of the asset
      </Text>
      <View style={styles.buttonRow}>
        <Button icon="camera" mode="outlined" onPress={handleCamera} style={{ marginRight: 8 }}>
          Camera
        </Button>
        <Button icon="image" mode="outlined" onPress={handleGallery}>
          Gallery
        </Button>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  overlay: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
  },
  placeholderContainer: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: "row",
  },
});
