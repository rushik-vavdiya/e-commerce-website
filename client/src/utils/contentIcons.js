// Bridges the JSON content files and the icon components.
//
// JSON can only hold text, so a content entry names its icon with a short
// string ("truck") and the component looks the component up here. Brand marks
// (social and payment) are not part of lucide-react and live in brandGlyphs.js.
import {
  Award,
  Clock,
  Gift,
  Headset,
  Heart,
  HelpCircle,
  Leaf,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  Tags,
  Truck,
} from 'lucide-react';

// Key -> component. Add a name here before using it in siteContent.json.
export const contentIcons = {
  award: Award,
  clock: Clock,
  gift: Gift,
  headset: Headset,
  heart: Heart,
  helpCircle: HelpCircle,
  leaf: Leaf,
  mail: Mail,
  mapPin: MapPin,
  messageCircle: MessageCircle,
  package: Package,
  phone: Phone,
  rotateCcw: RotateCcw,
  shieldCheck: ShieldCheck,
  sparkles: Sparkles,
  star: Star,
  tag: Tag,
  tags: Tags,
  truck: Truck,
};

// Returns the component for a content icon name. An unknown name falls back to
// the neutral sparkle instead of rendering nothing.
export const contentIcon = (name, Fallback = Sparkles) =>
  contentIcons[name] ?? Fallback;
