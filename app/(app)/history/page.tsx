import { ChartAreaInteractive } from "@/features/history/components/chart-area-interactive"
import { DataTable } from "@/features/history/components/data-table"
import { SectionCards } from "@/features/history/components/section-cards"

import data from "./data.json"

export default function HistoryPage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <DataTable data={data} />
    </div>
  )
}
