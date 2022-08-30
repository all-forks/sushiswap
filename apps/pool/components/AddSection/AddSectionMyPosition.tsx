import { Transition } from '@headlessui/react'
import { ChainId } from '@sushiswap/chain'
import { formatPercent, formatUSD } from '@sushiswap/format'
import { FundSource, useIsMounted } from '@sushiswap/hooks'
import { Currency, Currency as UICurrency, Typography } from '@sushiswap/ui'
import { Chef, useBalance, useFarmRewards, useMasterChef } from '@sushiswap/wagmi'
import React, { FC } from 'react'
import useSWR from 'swr'
import { useAccount } from 'wagmi'

import { CHEF_TYPE_MAP } from '../../lib/constants'
import { useTokenAmountDollarValues, useTokensFromPair, useUnderlyingTokenBalanceFromPair } from '../../lib/hooks'
import { PairWithAlias } from '../../types'

interface AddSectionMyPositionProps {
  pair: PairWithAlias
  chefType: Chef
  farmId: number
}

export const AddSectionMyPosition: FC<{ chainId: ChainId; poolAddress: string }> = ({ chainId, poolAddress }) => {
  const isMounted = useIsMounted()
  const { data: rewards } = useFarmRewards()
  const { data } = useSWR<{ pair: PairWithAlias }>(`/pool/api/pool/${poolAddress.toLowerCase()}`, (url) =>
    fetch(url).then((response) => response.json())
  )

  const farmId = rewards?.[chainId]?.farms[poolAddress.toLowerCase()]?.id
  const chefType = rewards?.[chainId]?.farms[poolAddress.toLowerCase()]?.chefType
    ? CHEF_TYPE_MAP[rewards?.[chainId]?.farms[poolAddress.toLowerCase()]?.chefType]
    : undefined

  if (!data || !chefType || farmId === undefined || !isMounted) return <></>
  const { pair } = data

  return (
    <Transition
      appear
      show={true}
      enter="transition duration-300 origin-center ease-out"
      enterFrom="transform scale-90 opacity-0"
      enterTo="transform scale-100 opacity-100"
      leave="transition duration-75 ease-out"
      leaveFrom="transform opacity-100"
      leaveTo="transform opacity-0"
    >
      <_AddSectionMyPosition pair={pair} farmId={farmId} chefType={chefType} />
    </Transition>
  )
}

const _AddSectionMyPosition: FC<AddSectionMyPositionProps> = ({ pair, chefType, farmId }) => {
  const { address } = useAccount()
  const { data: rewards } = useFarmRewards()

  const { token0, token1, reserve0, reserve1, totalSupply, liquidityToken } = useTokensFromPair(pair)
  const { data: balance } = useBalance({ chainId: pair.chainId, currency: liquidityToken, account: address })
  const { balance: stakedBalance } = useMasterChef({
    chainId: pair.chainId,
    chef: chefType,
    pid: farmId,
    token: liquidityToken,
  })

  const underlying = useUnderlyingTokenBalanceFromPair({
    reserve0: reserve0.wrapped,
    reserve1: reserve1.wrapped,
    totalSupply,
    balance: balance?.[FundSource.WALLET].wrapped,
  })
  const [underlying0, underlying1] = underlying
  const [value0, value1] = useTokenAmountDollarValues({ chainId: pair.chainId, amounts: underlying })

  const stakedUnderlying = useUnderlyingTokenBalanceFromPair({
    reserve0: reserve0.wrapped,
    reserve1: reserve1.wrapped,
    totalSupply,
    balance: stakedBalance,
  })
  const [stakedUnderlying0, stakedUnderlying1] = stakedUnderlying
  const [stakedValue0, stakedValue1] = useTokenAmountDollarValues({ chainId: pair.chainId, amounts: stakedUnderlying })

  const incentives = rewards?.[pair.chainId]?.farms[pair.id]?.incentives
  const rewardAPR = (incentives?.reduce((acc, cur) => acc + (cur.apr || 0), 0) || 0) / 100
  const totalAPR = rewardAPR + pair.apr / 100

  return (
    <>
      <div className="flex flex-col bg-white bg-opacity-[0.04] rounded-2xl">
        <div className="p-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 items-center gap-2">
            <Typography variant="xs" weight={500} className="text-slate-300">
              Total APR:
            </Typography>
            <Typography variant="xs" weight={500} className="text-slate-300 text-right">
              {formatPercent(totalAPR)}
            </Typography>
            <Typography variant="xs" weight={500} className="text-slate-300">
              Fee APR:
            </Typography>
            <Typography variant="xs" weight={500} className="text-slate-300 text-right">
              {formatPercent(pair.apr / 100)}
            </Typography>
            <Typography variant="xs" weight={500} className="text-slate-300">
              Reward APR:
            </Typography>
            <Typography variant="xs" weight={500} className="text-slate-300 text-right">
              {formatPercent(rewardAPR)}
            </Typography>
            <Typography variant="xs" weight={500} className="text-slate-300">
              Farming Rewards:
            </Typography>
            <div className="flex justify-end -mr-2">
              <UICurrency.IconList iconWidth={16} iconHeight={16}>
                {incentives?.map((incentive, index) => (
                  <UICurrency.Icon key={index} currency={incentive.rewardToken} />
                ))}
              </UICurrency.IconList>
            </div>
          </div>
        </div>
        <div className="px-5">
          <hr className="h-px border-t border-slate-200/5" />
        </div>
        <div className="p-5 pb-2 flex flex-col gap-2">
          <div className="flex gap-1 justify-between items-center">
            <Typography variant="sm" weight={600} className="text-slate-50">
              My Liquidity Position
            </Typography>
            <Typography variant="xs" weight={500} className="text-slate-400">
              {balance ? (
                formatUSD(Number(value0) + Number(value1))
              ) : (
                <div className="bg-slate-700 rounded-full h-[16px] my-0.5 animate-pulse w-[60px]" />
              )}
            </Typography>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4">
                <Currency.Icon currency={token0} width={16} height={16} />
              </div>
              <Typography variant="xs" weight={500} className="flex items-center gap-1 text-slate-400">
                {balance && underlying0?.toSignificant(3)} {underlying0?.currency.symbol}
              </Typography>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4">
                <Currency.Icon currency={token1} width={16} height={16} />
              </div>
              <Typography variant="xs" weight={500} className="flex items-center gap-1 text-slate-400">
                {balance && underlying1?.toSignificant(3)} {underlying1?.currency.symbol}
              </Typography>
            </div>
          </div>
        </div>
        <div className="p-5 flex flex-col gap-2">
          <div className="flex gap-1 justify-between items-center">
            <Typography variant="sm" weight={600} className="text-slate-50">
              My Staked Position
            </Typography>
            <Typography variant="xs" weight={500} className="text-slate-400">
              {stakedBalance ? (
                formatUSD(Number(stakedValue0) + Number(stakedValue1))
              ) : (
                <div className="bg-slate-700 rounded-full h-[16px] my-0.5 animate-pulse w-[60px]" />
              )}
            </Typography>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4">
                <Currency.Icon currency={token0} width={16} height={16} />
              </div>
              <Typography variant="xs" weight={500} className="flex items-center gap-1 text-slate-400">
                {stakedBalance && stakedUnderlying0?.toSignificant(3)} {stakedUnderlying0?.currency.symbol}
              </Typography>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4">
                <Currency.Icon currency={token1} width={16} height={16} />
              </div>
              <Typography variant="xs" weight={500} className="flex items-center gap-1 text-slate-400">
                {stakedBalance && stakedUnderlying1?.toSignificant(3)} {stakedUnderlying1?.currency.symbol}
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}