"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import { createReview } from "../../../lib/client-api";

export function ReviewForm({ productSlug }: { productSlug: string }) {
  const router = useRouter();
  const [rating, setRating] = useState("5");
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");

    try {
      await createReview(productSlug, { rating: Number(rating), title, comment });
      setTitle("");
      setComment("");
      setMessage("Review published. Thank you for sharing your experience.");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="review-rating">Rating</label>
        <select id="review-rating" value={rating} onChange={(event) => setRating(event.target.value)}>
          <option value="5">5 stars</option>
          <option value="4">4 stars</option>
          <option value="3">3 stars</option>
          <option value="2">2 stars</option>
          <option value="1">1 star</option>
        </select>
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
