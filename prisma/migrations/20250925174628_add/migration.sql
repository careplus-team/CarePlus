-- CreateTable
CREATE TABLE "public"."doctor" (
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "medicalregno" TEXT NOT NULL,
    "gender" "public"."gender" NOT NULL,
    "phoneNumber" TEXT,
    "address" TEXT,
    "workplace" TEXT,
    "bio" TEXT,
    "profilePicture" TEXT DEFAULT '/temp_doctor.webp',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doctor_pkey" PRIMARY KEY ("email")
);

-- CreateIndex
CREATE UNIQUE INDEX "doctor_email_key" ON "public"."doctor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_medicalregno_key" ON "public"."doctor"("medicalregno");
