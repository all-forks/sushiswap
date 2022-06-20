import { AdjustmentsIcon, ChevronRightIcon } from '@heroicons/react/outline'
import { Typography } from '@sushiswap/ui'
import { useState } from 'react'

export const SlippageToleranceOverlay = () => {
  const [open, setOpen] = useState<boolean>()

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group items-center relative rounded-xl flex justify-between gap-3 w-full"
      >
        <div className="w-5 h-5 flex items-center justify-center">
          <AdjustmentsIcon width={20} height={20} className="-ml-0.5 text-slate-500" />
        </div>
        <div className="flex gap-1 w-full justify-between items-center py-4">
          <Typography variant="sm" weight={700}>
            Slippage Tolerance
          </Typography>
          <div className="flex gap-1">
            <Typography variant="sm" className="group-hover:text-slate-200 text-slate-300">
              Instant
            </Typography>
            <div className="w-5 h-5 -mr-1.5 flex items-center">
              <ChevronRightIcon width={16} height={16} className="group-hover:text-slate-200 text-slate-300" />
            </div>
          </div>
        </div>
      </button>
    </>
  )
}