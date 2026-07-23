"use client";

import type { TDeal } from "@/interface/deals.interface";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CustomAvatar from "@/components/custom/CustomAvatar";
import UserCard from "@/components/common/UserCard";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useRouter } from "next/navigation";
import Image from "next/image";

dayjs.extend(utc);

interface DealCardProps {
  deal: TDeal;
}

export default function DealCard({ deal }: DealCardProps) {
  const router = useRouter();

  return (
    <Card className="h-full flex flex-col gap-3 py-3">
      <CardHeader className="p-3 py-0">
        <Image
          src={deal.image || "/deal-placeholder.jpg"}
          alt={deal.title}
          height={400}
          width={500}
          className="h-48 w-full object-cover"
        />
      </CardHeader>

      <CardContent className="flex-1 p-3 py-0 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg line-clamp-2 mb-2">
                {deal.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {deal.description}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Start:</span>
              <p className="font-medium">
                {dayjs
                  .utc(deal.startTime as string)
                  .local()
                  .format("DD MMM, YYYY")}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">End:</span>
              <p className="font-medium">
                {dayjs
                  .utc(deal.endTime as string)
                  .local()
                  .format("DD MMM, YYYY")}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-muted-foreground">Products:</span>
              <span className="ml-1 font-medium">
                {deal.products.length} items
              </span>
            </div>
            <div
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                deal.isActive
                  ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
              }`}
            >
              {deal.isActive ? "Active" : "Inactive"}
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            <div className="flex items-center justify-between mb-1">
              <span>Created:</span>
              <span>
                {dayjs
                  .utc(deal.createdAt as string)
                  .local()
                  .format("DD MMM, YYYY")}
              </span>
            </div>
            {deal.createdBy && (
              <div className="flex items-center justify-between">
                <span>By:</span>
                <UserCard size="sm" user={deal.createdBy} />
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-3 pt-3 border-t">
          <Button variant="view_button" size="sm" className="flex-1" />
          <Button
            onClick={() => router.push(`/deal/update-deal/${deal._id}`)}
            variant="edit_button"
            size="sm"
            className="flex-1"
          />
          <Button variant="delete_button" size="sm" className="flex-1" />
        </div>
      </CardContent>
    </Card>
  );
}
