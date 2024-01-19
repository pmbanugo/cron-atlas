ALTER TABLE jobs ADD `job_type` text DEFAULT 'url' NOT NULL;--> statement-breakpoint
ALTER TABLE jobs ADD `function_config` text;