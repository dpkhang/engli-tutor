import { Bell, Paintbrush, UsersRound } from "lucide-react";
import { ModulePlaceholder } from "@/features/layout";

export default function SettingsPage() {
  return <ModulePlaceholder eyebrow="Workspace" title="Cài đặt" description="Cấu hình workspace, thành viên, thương hiệu và thông báo." capabilities={[
    { title: "Workspace profile", description: "Tên workspace, logo và thông tin nhận diện chung.", icon: <Paintbrush className="size-5" /> },
    { title: "Members & roles", description: "Mời thành viên và phân quyền quản trị, editor, viewer.", icon: <UsersRound className="size-5" /> },
    { title: "Notifications", description: "Chọn thông báo về publish, lead mới và thanh toán.", icon: <Bell className="size-5" /> },
  ]} />;
}
