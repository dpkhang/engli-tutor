import { BadgeCheck, Globe2, ShieldCheck } from "lucide-react";
import { ModulePlaceholder } from "@/features/layout";

export default function DomainsPage() {
  return <ModulePlaceholder eyebrow="Publishing" title="Tên miền" description="Kết nối custom domain và quản lý nơi xuất bản landing page." capabilities={[
    { title: "Custom domains", description: "Thêm domain và cung cấp bản ghi DNS cần cấu hình.", icon: <Globe2 className="size-5" /> },
    { title: "Verification", description: "Kiểm tra DNS và trạng thái xác minh domain.", icon: <BadgeCheck className="size-5" /> },
    { title: "SSL", description: "Theo dõi chứng chỉ HTTPS và trạng thái bảo mật.", icon: <ShieldCheck className="size-5" /> },
  ]} />;
}
