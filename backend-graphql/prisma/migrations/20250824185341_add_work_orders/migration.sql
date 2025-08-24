/*
  Warnings:

  - You are about to alter the column `total_amount` on the `invoices` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - The `status` column on the `work_orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `total_cost` on the `work_orders` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - Made the column `created_at` on table `appointments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `appointments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `clients` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `clients` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `companies` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `companies` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `inspection_templates` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `inspection_templates` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `invoices` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `invoices` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `pre_work_orders` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `pre_work_orders` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `vehicles` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `vehicles` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `title` to the `work_orders` table without a default value. This is not possible if the table is not empty.
  - Made the column `created_at` on table `work_orders` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `work_orders` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."WorkOrderStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'ON_HOLD', 'CLOSED', 'CANCELED');

-- CreateEnum
CREATE TYPE "public"."WorkOrderPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- AlterTable
ALTER TABLE "public"."appointments" ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET NOT NULL,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."clients" ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET NOT NULL,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."companies" ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET NOT NULL,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."inspection_templates" ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET NOT NULL,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."invoices" ALTER COLUMN "total_amount" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET NOT NULL,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."pre_work_orders" ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET NOT NULL,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."users" ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET NOT NULL,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."vehicles" ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET NOT NULL,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."work_orders" ADD COLUMN     "assigned_user_id" INTEGER,
ADD COLUMN     "estimated_cost" DECIMAL(10,2),
ADD COLUMN     "km_at_service" INTEGER,
ADD COLUMN     "priority" "public"."WorkOrderPriority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "scheduled_end" TIMESTAMP(3),
ADD COLUMN     "scheduled_start" TIMESTAMP(3),
ADD COLUMN     "title" VARCHAR(160) NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "public"."WorkOrderStatus" NOT NULL DEFAULT 'OPEN',
ALTER COLUMN "total_cost" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET NOT NULL,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "appointments_vehicle_id_idx" ON "public"."appointments"("vehicle_id");

-- CreateIndex
CREATE INDEX "appointments_date_idx" ON "public"."appointments"("date");

-- CreateIndex
CREATE INDEX "appointments_status_idx" ON "public"."appointments"("status");

-- CreateIndex
CREATE INDEX "invoices_paid_idx" ON "public"."invoices"("paid");

-- CreateIndex
CREATE INDEX "invoices_issue_date_idx" ON "public"."invoices"("issue_date");

-- CreateIndex
CREATE INDEX "pre_work_orders_vehicle_id_idx" ON "public"."pre_work_orders"("vehicle_id");

-- CreateIndex
CREATE INDEX "pre_work_orders_template_id_idx" ON "public"."pre_work_orders"("template_id");

-- CreateIndex
CREATE INDEX "vehicles_client_id_idx" ON "public"."vehicles"("client_id");

-- CreateIndex
CREATE INDEX "vehicles_company_id_idx" ON "public"."vehicles"("company_id");

-- CreateIndex
CREATE INDEX "vehicles_license_plate_idx" ON "public"."vehicles"("license_plate");

-- CreateIndex
CREATE INDEX "vehicles_vin_idx" ON "public"."vehicles"("vin");

-- CreateIndex
CREATE INDEX "work_orders_client_id_idx" ON "public"."work_orders"("client_id");

-- CreateIndex
CREATE INDEX "work_orders_vehicle_id_idx" ON "public"."work_orders"("vehicle_id");

-- CreateIndex
CREATE INDEX "work_orders_status_idx" ON "public"."work_orders"("status");

-- CreateIndex
CREATE INDEX "work_orders_priority_idx" ON "public"."work_orders"("priority");

-- CreateIndex
CREATE INDEX "work_orders_assigned_user_id_idx" ON "public"."work_orders"("assigned_user_id");

-- CreateIndex
CREATE INDEX "work_orders_scheduled_start_idx" ON "public"."work_orders"("scheduled_start");

-- CreateIndex
CREATE INDEX "work_orders_end_date_idx" ON "public"."work_orders"("end_date");

-- AddForeignKey
ALTER TABLE "public"."work_orders" ADD CONSTRAINT "work_orders_assigned_user_id_fkey" FOREIGN KEY ("assigned_user_id") REFERENCES "public"."users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
