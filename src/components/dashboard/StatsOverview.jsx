import React from 'react';
import { Card } from "@/components/ui/card";
import { Link2, MousePointer, Users } from "lucide-react";

export default function StatsOverview({ totalLinks, totalClicks, activePartnerships }) {
  const stats = [
    {
      title: "Total Links",
      value: totalLinks,
      icon: Link2,
      color: "text-black",
      bgColor: "bg-gray-100"
    },
    {
      title: "Total Clicks",
      value: totalClicks,
      icon: MousePointer,
      color: "text-black",
      bgColor: "bg-gray-100"
    },
    {
      title: "Active Partnerships",
      value: activePartnerships,
      icon: Users,
      color: "text-black",
      bgColor: "bg-gray-100"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="p-6 border-none shadow-sm rounded-xl hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-4">
            <div className={`${stat.bgColor} p-3 rounded-xl`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.title}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}