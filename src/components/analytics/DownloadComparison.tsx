'use client';

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ✅ Export right under component definition (like your previous structure)
export default function DownloadComparison() {
  const data = [
    { name: "Mon", thisWeek: 120, lastWeek: 100 },
    { name: "Tue", thisWeek: 190, lastWeek: 160 },
    { name: "Wed", thisWeek: 170, lastWeek: 150 },
    { name: "Thu", thisWeek: 250, lastWeek: 200 },
    { name: "Fri", thisWeek: 220, lastWeek: 210 },
    { name: "Sat", thisWeek: 300, lastWeek: 280 },
    { name: "Sun", thisWeek: 260, lastWeek: 230 },
  ];

  const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/80 text-white p-2 rounded-md text-sm">
          <p className="font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-gray-300">
              {entry.name}: {entry.value} downloads
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 bg-black text-white min-h-screen">
      <Card className="bg-[#111] border border-gray-800 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-white">Download Comparison</CardTitle>
          <CardDescription className="text-gray-400">
            This Week vs Last Week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="thisWeek"
                  stroke="#007aff"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  name="This Week"
                />
                <Line
                  type="monotone"
                  dataKey="lastWeek"
                  stroke="#b0b0b0"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  name="Last Week"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center mt-6 gap-4">
            <Badge
              variant="outline"
              className="bg-[#007aff]/10 border-[#007aff]/30 text-[#007aff]"
            >
              This Week
            </Badge>
            <Badge
              variant="outline"
              className="bg-gray-700/40 border-gray-600 text-gray-300"
            >
              Last Week
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
