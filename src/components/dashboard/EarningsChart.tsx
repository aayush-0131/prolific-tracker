"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { format, parseISO } from "date-fns"

interface EarningsChartProps {
  data: Array<{
    date: string
    amountGBP: number
    amountUSD: number
    count: number
  }>
  currency: string
}

export default function EarningsChart({ data, currency }: EarningsChartProps) {
  const chartData = data.map(item => ({
    date: format(parseISO(item.date), "M/d"),
    GBP: item.amountGBP,
    USD: item.amountUSD,
    count: item.count,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Earnings Overview</CardTitle>
        <CardDescription>Daily earnings for the last 30 days (both currencies)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickMargin={10}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `£${value}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null

                return (
                  <div className="bg-white p-3 border rounded-lg shadow-lg">
                    <p className="font-semibold">{payload[0].payload.date}</p>
                    <p className="text-green-600">£{payload[0].payload.GBP.toFixed(2)}</p>
                    <p className="text-blue-600">${payload[0].payload.USD.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      {payload[0].payload.count} studies
                    </p>
                  </div>
                )
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="GBP"
              stroke="#22c55e"
              strokeWidth={2}
              name="GBP (£)"
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="USD"
              stroke="#3b82f6"
              strokeWidth={2}
              name="USD ($)"
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
