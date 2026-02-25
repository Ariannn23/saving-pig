import {
  Utensils,
  Car,
  Activity,
  Gamepad2,
  Zap,
  ShoppingBag,
  Home,
  DollarSign,
  Folder,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  Utensils,
  Car,
  Activity,
  Gamepad2,
  Zap,
  ShoppingBag,
  Home,
  DollarSign,
  Folder,
};

export const getCategoryIcon = (
  iconName: string | undefined,
  type: string,
  size = 20,
) => {
  const Icon =
    (iconName && ICON_MAP[iconName]) ||
    (type === "income" ? ArrowUpCircle : ArrowDownCircle);
  return <Icon size={size} />;
};
