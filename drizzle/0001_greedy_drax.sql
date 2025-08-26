ALTER TABLE "permissions" ADD CONSTRAINT "permissions_name_unique" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_name_unique" UNIQUE("name");