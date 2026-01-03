import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Share } from '@capacitor/share';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

// Check if we're running on a native platform
export const isNativePlatform = () => {
  return Capacitor.isNativePlatform();
};

// Haptic feedback helpers
export const triggerHaptic = async (style: 'light' | 'medium' | 'heavy' = 'light') => {
  if (!isNativePlatform()) return;

  try {
    const hapticStyle = style === 'light' ? ImpactStyle.Light :
                       style === 'medium' ? ImpactStyle.Medium :
                       ImpactStyle.Heavy;
    await Haptics.impact({ style: hapticStyle });
  } catch (error) {
    console.log('Haptic not available:', error);
  }
};

export const triggerSelectionHaptic = async () => {
  if (!isNativePlatform()) return;

  try {
    await Haptics.selectionStart();
  } catch (error) {
    console.log('Haptic not available:', error);
  }
};

// Camera helpers
export const takePhoto = async (): Promise<{ data: string; mimeType: string } | null> => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera
    });

    if (image.base64String) {
      return {
        data: image.base64String,
        mimeType: `image/${image.format}`
      };
    }
    return null;
  } catch (error) {
    console.error('Camera error:', error);
    return null;
  }
};

export const pickImage = async (): Promise<{ data: string; mimeType: string } | null> => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos
    });

    if (image.base64String) {
      return {
        data: image.base64String,
        mimeType: `image/${image.format}`
      };
    }
    return null;
  } catch (error) {
    console.error('Photo picker error:', error);
    return null;
  }
};

// Share helper
export const shareContent = async (title: string, text: string): Promise<boolean> => {
  try {
    await Share.share({
      title,
      text,
      dialogTitle: title
    });
    return true;
  } catch (error) {
    console.error('Share error:', error);
    return false;
  }
};

// Browser helper
export const openUrl = async (url: string): Promise<void> => {
  try {
    await Browser.open({ url });
  } catch (error) {
    console.error('Browser error:', error);
    // Fallback to window.open
    window.open(url, '_blank');
  }
};

// Copy to clipboard helper
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Clipboard error:', error);
    return false;
  }
};
