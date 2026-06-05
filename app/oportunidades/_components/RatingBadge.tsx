type Props = {
  rating: number | null;
  reviews: number | null;
};

export function RatingBadge({ rating, reviews }: Props) {
  if (rating == null) {
    return <span className="text-zinc-500 text-xs">—</span>;
  }

  const color =
    rating >= 4.5
      ? "text-emerald-300"
      : rating >= 4.0
        ? "text-amber-300"
        : rating >= 3.5
          ? "text-orange-300"
          : "text-red-400";

  return (
    <span className={`inline-flex items-center gap-1 text-sm font-bold tabular-nums ${color}`}>
      ★ {rating.toFixed(1)}
      {reviews != null ? (
        <span className="text-[11px] font-normal text-zinc-400">
          · {reviews.toLocaleString("pt-BR")}
        </span>
      ) : null}
    </span>
  );
}
