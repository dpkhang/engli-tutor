import { Check, CreditCard, ReceiptText } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@landing-page-generator/ui";
import { PageHeader } from "@/features/layout";

export default function PaymentsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Billing"
        title="Thanh toán"
        description="Quản lý gói dịch vụ, phương thức thanh toán và lịch sử hóa đơn."
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card className="border-primary/30 shadow-none">
          <CardHeader className="flex-row items-start justify-between">
            <div className="space-y-2">
              <CardTitle>Free</CardTitle>
              <p className="text-3xl font-bold">
                0₫ <span className="text-sm font-normal text-muted-foreground">/ tháng</span>
              </p>
            </div>
            <Badge>Hiện tại</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {["Quản lý landing page", "Xuất bản cơ bản", "Thống kê nội dung"].map((item) => (
              <p key={item} className="flex items-center gap-2 text-sm">
                <Check className="size-4 text-primary" />
                {item}
              </p>
            ))}
            <Button className="w-full" disabled>
              Nâng cấp — sắp ra mắt
            </Button>
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="size-5 text-primary" /> Phương thức thanh toán
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                Chưa có phương thức thanh toán. Billing API chưa được kết nối.
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ReceiptText className="size-5 text-primary" /> Lịch sử hóa đơn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                Chưa phát sinh hóa đơn.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
