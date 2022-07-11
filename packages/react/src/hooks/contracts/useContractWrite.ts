import * as React from 'react'
import {
  WriteContractArgs,
  WriteContractPreparedArgs,
  WriteContractResult,
  writeContract,
} from '@wagmi/core'
import { useMutation } from 'react-query'

import { MutationConfig } from '../../types'

export type UseContractWriteArgs = Omit<WriteContractArgs, 'request' | 'type'> &
  (
    | {
        /**
         * `dangerouslyUnprepared`: Allow to pass through unprepared config. Note: This has harmful
         * UX side-effects, it is highly recommended to not use this and instead prepare the config upfront
         * using the `useContractWritePrepare` hook. [Read more](/TODO)
         *
         * `prepared`: The config has been prepared with parameters required for performing a contract write
         * via the [`useContractWritePrepare` hook](/TODO)
         * */
        mode: 'prepared'
        /** The prepared request to perform a contract write. */
        request: WriteContractPreparedArgs['request'] | undefined
      }
    | {
        mode: 'dangerouslyUnprepared'
        request?: undefined
      }
  )
export type UseContractWriteMutationArgs = {
  /**
   * Dangerously pass through unprepared config. Note: This has harmful
   * UX side-effects, it is highly recommended to not use this and instead
   * prepare the config upfront using the `useContractWritePrepare` function.
   * [Read more](/TODO)
   */
  dangerouslySetArgs?: WriteContractArgs['args']
  dangerouslySetOverrides?: WriteContractArgs['overrides']
}
export type UseContractWriteConfig = MutationConfig<
  WriteContractResult,
  Error,
  UseContractWriteArgs
>

type ContractWriteFn = (overrideConfig?: UseContractWriteMutationArgs) => void
type ContractWriteAsyncFn = (
  overrideConfig?: UseContractWriteMutationArgs,
) => Promise<WriteContractResult>
type MutateFnReturnValue<Args, Fn> = Args extends {
  mode: 'dangerouslyUnprepared'
}
  ? Fn
  : Fn | undefined

export const mutationKey = ([
  {
    addressOrName,
    args,
    chainId,
    contractInterface,
    functionName,
    overrides,
    request,
  },
]: [UseContractWriteArgs]) =>
  [
    {
      entity: 'writeContract',
      addressOrName,
      args,
      chainId,
      contractInterface,
      functionName,
      overrides,
      request,
    },
  ] as const

const mutationFn = ({
  addressOrName,
  args,
  chainId,
  contractInterface,
  functionName,
  mode,
  overrides,
  request,
}: WriteContractArgs) => {
  return writeContract({
    addressOrName,
    args,
    chainId,
    contractInterface,
    functionName,
    mode,
    overrides,
    request,
  } as WriteContractArgs)
}

/**
 * @description Hook for calling an ethers Contract [write](https://docs.ethers.io/v5/api/contract/contract/#Contract--write)
 * method.
 *
 * It is highly recommended to pair this with the [`useContractWritePrepare` hook](/docs/hooks/useContractWritePrepare)
 * to [avoid UX issues](/TODO).
 */
export function useContractWrite<
  Args extends UseContractWriteArgs = UseContractWriteArgs,
>({
  addressOrName,
  args,
  chainId,
  contractInterface,
  functionName,
  mode,
  overrides,
  request,
  onError,
  onMutate,
  onSettled,
  onSuccess,
}: Args & UseContractWriteConfig) {
  const {
    data,
    error,
    isError,
    isIdle,
    isLoading,
    isSuccess,
    mutate,
    mutateAsync,
    reset,
    status,
    variables,
  } = useMutation(
    mutationKey([
      {
        addressOrName,
        contractInterface,
        functionName,
        args,
        chainId,
        mode,
        overrides,
        request,
      } as WriteContractArgs,
    ]),
    mutationFn,
    {
      onError,
      onMutate,
      onSettled,
      onSuccess,
    },
  )

  const write = React.useCallback(
    (overrideConfig?: UseContractWriteMutationArgs) => {
      return mutate({
        addressOrName,
        args: overrideConfig?.dangerouslySetArgs ?? args,
        chainId,
        contractInterface,
        functionName,
        mode: overrideConfig ? 'dangerouslyUnprepared' : mode,
        overrides: overrideConfig?.dangerouslySetOverrides ?? overrides,
        request,
      } as WriteContractArgs)
    },
    [
      addressOrName,
      args,
      chainId,
      contractInterface,
      functionName,
      mode,
      mutate,
      overrides,
      request,
    ],
  )

  const writeAsync = React.useCallback(
    (overrideConfig?: UseContractWriteMutationArgs) => {
      return mutateAsync({
        addressOrName,
        args: overrideConfig?.dangerouslySetArgs ?? args,
        chainId,
        contractInterface,
        functionName,
        mode: overrideConfig ? 'dangerouslyUnprepared' : mode,
        overrides: overrideConfig?.dangerouslySetOverrides ?? overrides,
        request,
      } as WriteContractArgs)
    },
    [
      addressOrName,
      args,
      chainId,
      contractInterface,
      functionName,
      mode,
      mutateAsync,
      overrides,
      request,
    ],
  )

  return {
    data,
    error,
    isError,
    isIdle,
    isLoading,
    isSuccess,
    reset,
    status,
    variables,
    write: (mode === 'prepared' && !request
      ? undefined
      : write) as MutateFnReturnValue<Args, ContractWriteFn>,
    writeAsync: (mode === 'prepared' && !request
      ? undefined
      : writeAsync) as MutateFnReturnValue<Args, ContractWriteAsyncFn>,
  }
}
