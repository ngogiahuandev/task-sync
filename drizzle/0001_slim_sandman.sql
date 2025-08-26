ALTER TABLE "users" ADD COLUMN "image_url" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_slug_unique" UNIQUE("slug");