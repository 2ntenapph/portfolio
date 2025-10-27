import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-6 py-12 sm:px-12 md:py-16">
      <section className="flex w-full flex-col items-center gap-6 text-center">
        <Skeleton className="h-4 w-36" />
        <div className="space-y-2">
          <Skeleton className="mx-auto h-10 w-64" />
          <Skeleton className="mx-auto h-10 w-72" />
        </div>
        <Skeleton className="h-6 w-80" />
        <div className="flex flex-wrap justify-center gap-3">
          <Skeleton className="h-12 w-40" />
          <Skeleton className="h-12 w-40" />
        </div>
      </section>

      <section className="flex w-full justify-center">
        <div className="flex items-center justify-center gap-4 rounded-full border border-border/60 bg-card/80 px-6 py-3 backdrop-blur">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-12 rounded-full" />
          ))}
        </div>
      </section>

      <section className="flex w-full flex-col gap-10 md:flex-row">
        <div className="flex w-full flex-1 flex-col gap-6">
          <Skeleton className="h-44 w-full rounded-3xl" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <div className="grid gap-3">
              {Array.from({ length: 2 }).map((_, index) => (
                <Skeleton key={index} className="h-24 w-full rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
        <div className="flex w-full flex-1 flex-col gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-[26rem] w-full rounded-3xl" />
        </div>
      </section>

      <section className="w-full max-w-4xl space-y-4 rounded-3xl border border-border/60 bg-card/80 p-6 shadow-lg">
        <Skeleton className="h-4 w-48" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full min-w-[18rem] rounded-2xl" />
          ))}
        </div>
      </section>

      <section className="w-full max-w-5xl space-y-6">
        <Skeleton className="mx-auto h-10 w-56" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-48 w-full rounded-3xl" />
          ))}
        </div>
      </section>

      <section className="w-full max-w-4xl space-y-6 rounded-[28px] border border-border/60 bg-card/80 px-6 py-10 text-center shadow-xl sm:px-10">
        <Skeleton className="mx-auto h-10 w-48" />
        <Skeleton className="mx-auto h-5 w-64" />
        <Skeleton className="mx-auto h-12 w-40" />
      </section>

      <section className="w-full max-w-4xl space-y-6">
        <Skeleton className="mx-auto h-10 w-56" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-40 w-full rounded-3xl" />
          <Skeleton className="h-40 w-full rounded-3xl" />
        </div>
        <Skeleton className="mx-auto h-4 w-56" />
      </section>
    </div>
  );
}
