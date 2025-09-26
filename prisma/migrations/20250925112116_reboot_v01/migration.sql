-- CreateEnum
CREATE TYPE "public"."gender" AS ENUM ('male', 'female', 'other');

-- CreateEnum
CREATE TYPE "public"."role" AS ENUM ('user', 'admin', 'doctor', 'emergency_manager', 'ambulance_operator');

-- CreateTable
CREATE TABLE "public"."user" (
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER,
    "gender" "public"."gender",
    "username" TEXT NOT NULL,
    "dateofbirth" TIMESTAMP(3),
    "mobilenumber" TEXT,
    "address" TEXT,
    "role" "public"."role" DEFAULT 'user',
    "profilePicture" TEXT DEFAULT '/temp_user.webp',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("email")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "public"."user"("email");
