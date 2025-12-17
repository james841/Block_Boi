/*
  Warnings:

  - You are about to drop the column `description` on the `Slider` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Slider` table. All the data in the column will be lost.
  - Added the required column `Button` to the `Slider` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtitle` to the `Slider` table without a default value. This is not possible if the table is not empty.
  - Made the column `title` on table `Slider` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Slider" DROP COLUMN "description",
DROP COLUMN "isActive",
ADD COLUMN     "Button" TEXT NOT NULL,
ADD COLUMN     "subtitle" TEXT NOT NULL,
ALTER COLUMN "title" SET NOT NULL;
