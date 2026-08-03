import { FileImage, FolderOpen, UploadCloud } from "lucide-react";
import { ModulePlaceholder } from "@/features/layout";

export default function MediaPage() {
  return <ModulePlaceholder eyebrow="Assets" title="Thư viện media" description="Tập trung hình ảnh và tài nguyên được sử dụng trong các landing page." capabilities={[
    { title: "Upload assets", description: "Tải hình ảnh lên Cloudflare R2 và theo dõi tiến trình.", icon: <UploadCloud className="size-5" /> },
    { title: "Folders", description: "Tổ chức tài nguyên theo chiến dịch và thư mục.", icon: <FolderOpen className="size-5" /> },
    { title: "Asset optimization", description: "Kiểm tra kích thước, định dạng và alt text trước khi dùng.", icon: <FileImage className="size-5" /> },
  ]} />;
}
