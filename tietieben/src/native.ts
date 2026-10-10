// Bridges to native iOS features when running inside the Capacitor app; no-ops on the web.
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export const isNative = Capacitor.isNativePlatform();

export function haptic(strength: 'light' | 'medium') {
  if (isNative) Haptics.impact({ style: strength === 'medium' ? ImpactStyle.Medium : ImpactStyle.Light }).catch(() => {});
  else
    try {
      navigator.vibrate?.(strength === 'medium' ? 8 : 5);
    } catch {
      /* not supported */
    }
}

/** Write the image to the app cache and open the iOS share sheet (Save Image, AirDrop, apps). */
export async function shareImage(blob: Blob, name: string) {
  const data = await new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result).split(',')[1]);
    r.onerror = rej;
    r.readAsDataURL(blob);
  });
  const { uri } = await Filesystem.writeFile({ path: name, data, directory: Directory.Cache });
  await Share.share({ title: '贴贴本', files: [uri] });
}
