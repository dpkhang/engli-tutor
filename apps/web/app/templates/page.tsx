import { LayoutTemplate, Palette, Sparkles } from "lucide-react";
import { ModulePlaceholder } from "@/features/layout";

export default function TemplatesPage() {
  return <ModulePlaceholder eyebrow="Content" title="Templates" description="Quản lý bộ mẫu tái sử dụng để khởi tạo landing page nhanh và đồng nhất." capabilities={[
    { title: "Template library", description: "Duyệt và phân loại template theo mục tiêu chiến dịch.", icon: <LayoutTemplate className="size-5" /> },
    { title: "Brand templates", description: "Lưu màu sắc, typography và components theo thương hiệu.", icon: <Palette className="size-5" /> },
    { title: "AI templates", description: "Gợi ý cấu trúc trang từ brief và mục tiêu chiến dịch.", icon: <Sparkles className="size-5" /> },
  ]} />;
}
