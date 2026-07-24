CREATE TABLE "email_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sendbyte_id" VARCHAR(120),
    "to" VARCHAR(320) NOT NULL,
    "subject" VARCHAR(500) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'queued',
    "tags" JSONB,
    "meta" JSONB,
    "sent_at" TIMESTAMPTZ,
    "delivered_at" TIMESTAMPTZ,
    "opened_at" TIMESTAMPTZ,
    "clicked_at" TIMESTAMPTZ,
    "bounced_at" TIMESTAMPTZ,
    "complained_at" TIMESTAMPTZ,
    "error" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "email_logs_sendbyte_id_key" ON "email_logs"("sendbyte_id");
CREATE INDEX "email_logs_status_idx" ON "email_logs"("status");
CREATE INDEX "email_logs_to_idx" ON "email_logs"("to");
