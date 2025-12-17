/*
  Warnings:

  - You are about to drop the column `email` on the `Admin` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `CategoryShowcase` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Admin_email_key";

-- AlterTable
ALTER TABLE "Admin" DROP COLUMN "email";

-- AlterTable
ALTER TABLE "CategoryShowcase" ADD COLUMN     "slug" TEXT,
ALTER COLUMN "imageUrl" DROP NOT NULL,
ALTER COLUMN "createdAt" DROP NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(6),
ALTER COLUMN "updatedAt" DROP NOT NULL,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(6);

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "isNew" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "category_showcase" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_showcase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "category_showcase_slug_key" ON "category_showcase"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryShowcase_slug_key" ON "CategoryShowcase"("slug");
