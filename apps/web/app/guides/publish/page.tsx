import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CircleCheck,
  ExternalLink,
  Globe2,
  Link2,
  MonitorCheck,
  Rocket,
  Sparkles,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Button,
} from "@landing-page-generator/ui";
import { PageHeader } from "@/features/layout";

const steps = [
  {
    number: 1,
    title: "Tạo nội dung",
    description: "Tạo landing page bằng AI hoặc thủ công, sau đó hoàn thiện nội dung chiến dịch.",
    icon: Sparkles,
    checks: ["Tên và slug rõ ràng", "Nội dung không còn placeholder", "Ảnh sử dụng URL public"],
    href: "/landing-pages/new",
    action: "Tạo landing page",
  },
  {
    number: 2,
    title: "Kiểm tra bản demo",
    description: "Mở demo từ trang chi tiết để kiểm tra trước khi khách hàng có thể truy cập.",
    icon: MonitorCheck,
    checks: ["Hiển thị tốt trên mobile", "CTA dẫn tới đúng vị trí", "Form nhận email hoặc số điện thoại"],
  },
  {
    number: 3,
    title: "Xuất bản",
    description: "Bấm Xuất bản trên thanh công cụ demo và chờ trạng thái chuyển sang Published.",
    icon: Rocket,
    checks: ["Có thông báo thành công", "Trạng thái là Published", "Public URL đã xuất hiện"],
  },
  {
    number: 4,
    title: "Mở link public",
    description: "Mở link trên site landing bằng cửa sổ ẩn danh để kiểm tra như một khách truy cập.",
    icon: Link2,
    checks: ["Không yêu cầu đăng nhập", "Ảnh tải đầy đủ", "Gửi thử một lead"],
  },
  {
    number: 5,
    title: "Chia sẻ hoặc gắn domain",
    description: "Chia sẻ URL mặc định hoặc gắn domain riêng sau khi DNS và SSL đã sẵn sàng.",
    icon: Globe2,
    checks: ["Domain đã xác minh", "SSL đang hoạt động", "Domain gắn đúng page Published"],
    href: "/domains",
    action: "Quản lý domain",
  },
] as const;

const issues = [
  ["Public URL trả 404", "Kiểm tra page đang Published và URL thuộc site landing, không phải workspace."],
  ["Không thấy nút Xuất bản", "Landing page cần có content trước khi có thể publish."],
  ["Ảnh không hiển thị", "URL ảnh phải dùng HTTPS và truy cập được khi không đăng nhập."],
  ["Form không gửi được", "Nhập email hoặc số điện thoại hợp lệ và đảm bảo page vẫn Published."],
  ["Domain chưa hoạt động", "Kiểm tra DNS, trạng thái xác minh, SSL và landing page đang được gắn."],
] as const;

export default function PublishLandingPageGuide() {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://pagecraft-ai.site").replace(/\/$/, "");

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Hướng dẫn"
        title="Publish landing page"
        description="Làm theo 5 bước để đưa trang từ bản nháp lên link public và sẵn sàng tiếp nhận khách hàng."
        action={
          <Button asChild>
            <Link href="/landing-pages/new">
              Tạo trang mới <ArrowRight />
            </Link>
          </Button>
        }
      />

      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <main className="min-w-0">
          <section aria-labelledby="steps-title">
            <div className="mb-6 flex items-center justify-between border-b pb-4">
              <div>
                <h2 id="steps-title" className="text-xl font-semibold">Các bước thực hiện</h2>
                <p className="mt-1 text-sm text-muted-foreground">Hoàn thành theo đúng thứ tự từ trên xuống.</p>
              </div>
              <Badge variant="secondary">5 bước</Badge>
            </div>

            <ol className="space-y-1">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <li key={step.number} className="relative grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4 pb-8">
                    {index < steps.length - 1 ? (
                      <span className="absolute top-10 bottom-0 left-5 w-px bg-border" aria-hidden />
                    ) : null}
                    <span className="relative z-10 grid size-10 place-items-center rounded-full border bg-background text-sm font-semibold text-primary">
                      {step.number}
                    </span>
                    <div className="pt-1">
                      <div className="flex items-center gap-2">
                        <Icon className="size-4.5 text-primary" />
                        <h3 className="font-semibold">{step.title}</h3>
                      </div>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{step.description}</p>
                      <ul className="mt-3 space-y-1.5 text-sm">
                        {step.checks.map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <Check className="mt-0.5 size-4 shrink-0 text-primary" /> {item}
                          </li>
                        ))}
                      </ul>
                      {"href" in step ? (
                        <Button asChild variant="link" className="mt-3 h-auto px-0">
                          <Link href={step.href}>
                            {step.action} <ArrowRight />
                          </Link>
                        </Button>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          <section aria-labelledby="details-title" className="mt-2">
            <h2 id="details-title" className="mb-4 text-xl font-semibold">Thông tin nghiệp vụ</h2>

            <Accordion type="single" collapsible defaultValue="requirements">
              <AccordionItem value="requirements">
                <AccordionTrigger>Điều kiện trước khi publish</AccordionTrigger>
                <AccordionContent>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {["Landing page có content", "Slug duy nhất", "Ảnh truy cập công khai", "CTA và form hợp lệ", "Không còn nội dung mẫu", "Tài khoản còn quyền sử dụng"].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <CircleCheck className="mt-1 size-4 shrink-0 text-primary" /> {item}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="statuses">
                <AccordionTrigger>Quy tắc trạng thái</AccordionTrigger>
                <AccordionContent className="max-w-none">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[580px] text-left">
                      <thead className="text-xs text-foreground">
                        <tr><th className="pb-2 font-medium">Trạng thái</th><th className="pb-2 font-medium">Public URL</th><th className="pb-2 font-medium">Ý nghĩa</th></tr>
                      </thead>
                      <tbody className="divide-y">
                        <tr><td className="py-3"><Badge variant="secondary">Draft</Badge></td><td className="py-3">Không hoạt động</td><td className="py-3">Đang soạn hoặc tạm ngừng.</td></tr>
                        <tr><td className="py-3"><Badge>Published</Badge></td><td className="py-3 text-primary">Hoạt động</td><td className="py-3">Khách có thể truy cập và gửi lead.</td></tr>
                        <tr><td className="py-3"><Badge variant="outline">Archived</Badge></td><td className="py-3">Không hoạt động</td><td className="py-3">Chiến dịch đã được lưu trữ.</td></tr>
                      </tbody>
                    </table>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="updates">
                <AccordionTrigger>Cập nhật hoặc ngừng trang đã publish</AccordionTrigger>
                <AccordionContent>
                  Chỉnh nội dung tại trang chi tiết rồi kiểm tra lại demo. Chuyển page về Draft để tạm ngừng hoặc Archived để kết thúc chiến dịch; public URL và domain sẽ không còn render trang.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="troubleshooting">
                <AccordionTrigger>Xử lý khi publish không thành công</AccordionTrigger>
                <AccordionContent className="max-w-none">
                  <div className="divide-y">
                    {issues.map(([problem, solution]) => (
                      <div key={problem} className="grid gap-1 py-3 sm:grid-cols-[12rem_minmax(0,1fr)]">
                        <p className="font-medium text-foreground">{problem}</p>
                        <p>{solution}</p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>
        </main>

        <aside className="space-y-5 lg:sticky lg:top-6">
          <div className="border-l-2 border-primary pl-4">
            <p className="text-sm font-semibold">Public URL</p>
            <p className="mt-2 break-all font-mono text-xs leading-5 text-muted-foreground">
              {siteUrl}/p/ten-slug-cua-ban
            </p>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-primary">
              <CircleCheck className="size-3.5" /> Không yêu cầu đăng nhập
            </p>
          </div>

          <div className="border-t pt-5">
            <p className="text-sm font-semibold">Trước khi chia sẻ</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {["Đang ở trạng thái Published", "Mở được trong cửa sổ ẩn danh", "Ảnh và CTA hoạt động", "Đã gửi thử một lead"].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" /> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t pt-5">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <AlertTriangle className="size-4 text-amber-600" /> Lưu ý
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Đổi slug sau khi chia sẻ sẽ làm thay đổi public URL.
            </p>
          </div>

          <Button asChild variant="outline" className="w-full">
            <Link href="/landing-pages">
              Kiểm tra trang <ExternalLink />
            </Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}
