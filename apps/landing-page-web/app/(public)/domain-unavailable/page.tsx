export default function DomainUnavailablePage() {
  return (
    <main className="grid min-h-svh place-items-center px-5">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold">Tên miền chưa sẵn sàng</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tên miền chưa được xác minh hoặc chưa gắn với landing page đã xuất bản.
        </p>
      </div>
    </main>
  );
}
