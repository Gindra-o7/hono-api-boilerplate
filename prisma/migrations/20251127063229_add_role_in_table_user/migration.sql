-- CreateEnum
CREATE TYPE "Role" AS ENUM ('pendaftar', 'admin', 'koordinator');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'pendaftar';
