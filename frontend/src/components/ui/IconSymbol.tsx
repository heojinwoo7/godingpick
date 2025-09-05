// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<string, ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = string;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'house': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'clock': 'schedule',
  'clock.fill': 'schedule',
  'person.3': 'people',
  'person.3.fill': 'people',
  'people': 'people',
  'bubble.left.and.bubble.right': 'chat',
  'bubble.left.and.bubble.right.fill': 'chat',
  'chat': 'chat',
  'star': 'star',
  'star.fill': 'star',
  // 안드로이드용 추가 아이콘
  'person.3.alt': 'people',
  'bubble.left.and.bubble.right.alt': 'chat',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  // 매핑이 없으면 기본 아이콘 사용
  const iconName = MAPPING[name] || 'help';
  
  // 안전한 렌더링을 위한 추가 검증
  if (!iconName || typeof iconName !== 'string') {
    console.warn(`[IconSymbol] 잘못된 아이콘 이름: ${name}, 기본 아이콘 사용`);
    return <MaterialIcons color={color} size={size} name="help" style={style} />;
  }
  
  return <MaterialIcons color={color} size={size} name={iconName} style={style} />;
}
