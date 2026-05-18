"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import { createReview } from "../../../lib/client-api";

export function ReviewForm({ productSlug }: { productSlug: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (rating === 0) {
      setMessage("Please select a rating before submitting.");
      return;
    }
    setPending(true);
    setMessage("");

    try {
      await createReview(productSlug, { rating, title, comment });
      setTitle("");
      setComment("");
      setRating(0);
      setMessage("Review published. Thank you for sharing your experience.");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <div className="review-rating-group">
        <label>Rating</label>
        <div className="review-star-selector">
          {[1, 2, 3, 4, 5].map((starValue) => (
            <button
              type="button"
              key={starValue}
              onClick={() => setRating(starValue)}
              className={starValue <= rating ? "active" : ""}
              aria-label={`Rate ${starValue} star${starValue > 1 ? "s" : ""}`}
            >
              <span className="material-symbols-outlined">
                {starValue <= rating ? "star" : "star_outline"}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="review-title">Review title</label>
        <input id="review-title" value={title} onChange={(event) => setTitle(event.target.value)} required placeholder="What stood out?" />
      </div>
      <div>
        <label htmlFor="review-comment">Your review</label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          required
          rows={4}
          placeholder="Share the taste, texture, packaging, or delivery experience."
        />
      </div>
      <button type="submit" disabled={pending}>
        {pending ? "Publishing..." : "Write Review"}
      </button>
      {message ? <p>{message}</p> : null}
    </form>
  );
}
