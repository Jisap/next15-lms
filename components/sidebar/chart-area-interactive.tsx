"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"


export const description = "An interactive area chart"

// Usar esta función para ver el gráfico de barras como ejemplo
const generateDummyEnrollments = (numDays: number) => {
  const endDate = new Date();
  const enrollments: { date: string; enrollments: number }[] = [];

  for (let i = numDays - 1; i >= 0; i--) {
    const date = new Date(endDate);
    date.setDate(endDate.getDate() - i);
    const dateString = date.toISOString().split("T")[0];
    const enrollmentsCount = Math.floor(Math.random() * 16) + 10; // Random number between 10 and 25
    enrollments.push({ date: dateString, enrollments: enrollmentsCount });
  }

  return enrollments;
};

const dummyEnrollments = generateDummyEnrollments(30);

const chartConfig = {
  enrollments:{
    label: "Enrollments",
    color: "var(--chart-1)",
  }
} satisfies ChartConfig



interface ChartAreaInteractiveProps {
  data: { date: string; enrollments: number }[];
}

export function ChartAreaInteractive({ data }: ChartAreaInteractiveProps) {

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Total Enrollments</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">Total Enrollments for the last 30 days: 1200</span>
          <span className="@[540px]/card:hidden">Last 30 days: 1200</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          className="aspect-auto h-[250px] w-full"
          config={chartConfig}
        >
          <BarChart
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tickMargin={8}
              interval={"preserveStartEnd"}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }} />

              <ChartTooltip content={
                <ChartTooltipContent 
                  className="w-[150px]" 
                  labelFormatter={(value) => {
                    const date = new Date(value)
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }} 
                />
              } 
              />

              <Bar 
                dataKey="enrollments" 
                fill="var(--color-enrollments)"
                radius={4}
              />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
