-- AlterTable
ALTER TABLE "public"."doctor" ADD COLUMN     "verification" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."admin" (
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_pkey" PRIMARY KEY ("email")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_email_key" ON "public"."admin"("email");
