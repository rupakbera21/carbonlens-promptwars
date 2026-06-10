"use client";

import { useEffect, useState } from "react";
import { formatCo2e } from "@/shared/utils/format";
import { Loading } from "@/presentation/components/common/loading";

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchActivities() {
      try {
        const res = await fetch("/api/activities");
        if (res.ok) {
          const data = await res.json();
          setActivities(data.data ?? []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchActivities();
  }, []);

  if (isLoading) return <Loading text="Loading activities..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Your Activities</h1>
        <p className="text-muted-foreground">All logged carbon emissions</p>
      </div>
      <div className="rounded-md border">
        <table className="w-full text-left text-sm text-muted-foreground">
          <thead className="border-b bg-muted/50 text-xs uppercase">
            <tr>
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Category</th>
              <th className="px-6 py-3 font-medium">Action</th>
              <th className="px-6 py-3 text-right font-medium">CO₂e</th>
            </tr>
          </thead>
          <tbody>
            {activities.length > 0 ? (
              activities.map((a) => (
                <tr key={a.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-6 py-4">
                    {new Date(a.activityDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 capitalize">{a.category}</td>
                  <td className="px-6 py-4 capitalize">
                    {a.subCategory.replace("_", " ")} ({a.quantity} {a.unit})
                  </td>
                  <td className="px-6 py-4 text-right font-medium">
                    {formatCo2e(a.co2eKg)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center">
                  No activities logged yet. Head to the dashboard to log your first one!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
