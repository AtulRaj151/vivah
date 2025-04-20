
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "./button";
import { Textarea } from "./textarea";
import { StarRating } from "./star-rating";

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10),
});

export function ReviewForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const form = useForm({
    resolver: zodResolver(reviewSchema),
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <StarRating onChange={(rating) => form.setValue("rating", rating)} />
      <Textarea 
        placeholder="Write your review..." 
        {...form.register("comment")}
      />
      <Button type="submit">Submit Review</Button>
    </form>
  );
}
