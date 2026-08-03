import { Download, ListFilter, UserRoundCheck } from "lucide-react";
import { ModulePlaceholder } from "@/features/layout";

export default function LeadsPage() {
  return <ModulePlaceholder eyebrow="Growth" title="Leads" description="Theo dõi người dùng gửi form và nguồn chuyển đổi từ từng landing page." capabilities={[
    { title: "Lead inbox", description: "Danh sách lead, trạng thái xử lý và landing page nguồn.", icon: <UserRoundCheck className="size-5" /> },
    { title: "Segments", description: "Lọc lead theo chiến dịch, tag, thời gian và trạng thái.", icon: <ListFilter className="size-5" /> },
    { title: "Export", description: "Xuất CSV hoặc đồng bộ lead sang CRM bên ngoài.", icon: <Download className="size-5" /> },
  ]} />;
}
