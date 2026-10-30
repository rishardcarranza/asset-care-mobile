import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";

const IMG_DIR = `${FileSystem.documentDirectory}asset_images/`;

// Ensure directory exists
export const initImageDirectory = async () => {
  const dirInfo = await FileSystem.getInfoAsync(IMG_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(IMG_DIR, { intermediates: true });
  }
};

export const pickImageFromGallery = async (): Promise<string | null> => {
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (permissionResult.granted === false) {
    alert("You've refused to allow this app to access your photos!");
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [16, 9],
    quality: 0.8,
  });

  if (!result.canceled && result.assets && result.assets.length > 0) {
    return result.assets[0].uri;
  }
  return null;
};

export const takePhotoWithCamera = async (): Promise<string | null> => {
  const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
  if (permissionResult.granted === false) {
    alert("You've refused to allow this app to access your camera!");
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [16, 9],
    quality: 0.8,
  });

  if (!result.canceled && result.assets && result.assets.length > 0) {
    return result.assets[0].uri;
  }
  return null;
};

export const saveImageToDocumentDirectory = async (tempUri: string): Promise<string | null> => {
  try {
    await initImageDirectory();
    
    // Extract filename and extension
    const filename = tempUri.split('/').pop() || `img_${Date.now()}.jpg`;
    
    // We add a timestamp to ensure uniqueness even if picking same original file twice
    const uniqueFilename = `${Date.now()}_${filename}`;
    const destUri = `${IMG_DIR}${uniqueFilename}`;
    
    await FileSystem.copyAsync({
      from: tempUri,
      to: destUri
    });
    
    // We return ONLY the filename to save in DB, not the absolute path
    // Absolute paths can change on iOS app updates
    return uniqueFilename;
  } catch (err) {
    console.error("Error saving image:", err);
    return null;
  }
};

export const getAbsoluteImageUri = (filename: string): string | null => {
  if (!filename) return null;
  return `${IMG_DIR}${filename}`;
};

export const deleteLocalImage = async (filename: string): Promise<void> => {
  if (!filename) return;
  try {
    const fileUri = `${IMG_DIR}${filename}`;
    const info = await FileSystem.getInfoAsync(fileUri);
    if (info.exists) {
      await FileSystem.deleteAsync(fileUri);
    }
  } catch (err) {
    console.warn("Could not delete old image:", err);
  }
};
