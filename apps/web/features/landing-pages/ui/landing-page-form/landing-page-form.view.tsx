"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "@landing-page-generator/ui";
import type { CreateLandingPageValues } from "../../model/schema";

export type LandingPageFormViewProps = {
  register: UseFormRegister<CreateLandingPageValues>;
  errors: FieldErrors<CreateLandingPageValues>;
  pending: boolean;
  error: string | null;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export function LandingPageFormView({
  register,
  errors,
  pending,
  error,
  onSubmit,
}: LandingPageFormViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-[family-name:var(--font-display)] text-xl tracking-tight">
          Tạo landing page
        </CardTitle>
        <CardDescription>
          Nhập tên chiến dịch — slug được gợi ý tự động, bạn có thể chỉnh lại.
        </CardDescription>
      </CardHeader>

      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="create-name">Tên</Label>
              <Input
                id="create-name"
                placeholder="Summer sale 2026"
                aria-invalid={Boolean(errors.name)}
                {...register("name")}
              />
              {errors.name ? (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-slug">Slug</Label>
              <Input
                id="create-slug"
                placeholder="summer-sale-2026"
                aria-invalid={Boolean(errors.slug)}
                {...register("slug")}
              />
              {errors.slug ? (
                <p className="text-xs text-destructive">{errors.slug.message}</p>
              ) : null}
            </div>
          </div>

          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
        </CardContent>

        <CardFooter className="border-t">
          <Button type="submit" disabled={pending}>
            {pending ? "Đang tạo..." : "Tạo trang"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
