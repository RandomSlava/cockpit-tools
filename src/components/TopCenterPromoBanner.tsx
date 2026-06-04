import { useCallback } from 'react';
import { openUrl } from '@tauri-apps/plugin-opener';
import { useTranslation } from 'react-i18next';
import { useTopRightAdStore } from '../stores/useTopRightAdStore';

interface TopCenterPromoBannerProps {
  reserveWhenEmpty?: boolean;
}

export function TopCenterPromoBanner({ reserveWhenEmpty = true }: TopCenterPromoBannerProps) {
  void reserveWhenEmpty;
  return null;
}
