"use client";
type Props = {
    onLike: () => void;
    onDislike: () => void;
    onComment: () => void;
    onShare: () => void;
};

export default function ReactionBar({ onLike, onDislike, onComment, onShare }: Props) {
    const common = "rounded bg-black/50 p-2 text-white hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white";
    return (
        <div className="pointer-events-auto flex flex-col items-center gap-3">
            <button aria-label="Beğen" className={common} onClick={onLike}>👍</button>
            <button aria-label="Beğenme" className={common} onClick={onDislike}>👎</button>
            <button aria-label="Yorum" className={common} onClick={onComment}>💬</button>
            <button aria-label="Paylaş" className={common} onClick={onShare}>↗</button>
        </div>
    );
}


