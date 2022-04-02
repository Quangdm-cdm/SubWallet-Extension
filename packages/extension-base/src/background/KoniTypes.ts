// Copyright 2019-2022 @polkadot/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ApiPromise } from '@polkadot/api';
import { SubmittableExtrinsicFunction } from '@polkadot/api/promise/types';
import {
  AccountJson, AuthorizeRequest,
  RequestAccountSubscribe, RequestAuthorizeApprove, RequestAuthorizeReject, RequestAuthorizeSubscribe,
  RequestBatchRestore,
  RequestCurrentAccountAddress,
  RequestDeriveCreate,
  RequestJsonRestore,
  ResponseAuthorizeList,
  SeedLengths
} from '@polkadot/extension-base/background/types';
import { MetadataDefBase } from '@polkadot/extension-inject/types';
import { Registry } from '@polkadot/types/types';
import { Keyring } from '@polkadot/ui-keyring';
import { KeypairType } from '@polkadot/util-crypto/types';

export enum ApiInitStatus {
  SUCCESS,
  ALREADY_EXIST,
  NOT_SUPPORT
}

export interface StakingRewardItem {
  state: APIItemState
  name: string,
  chainId: string,
  latestReward?: string,
  totalReward?: string,
  totalSlash?: string,
  smartContract?: string
}

export interface StakingRewardJson {
  details: Array<StakingRewardItem>
}

export interface StakingItem {
  name: string,
  chainId: string,
  balance?: string,
  nativeToken: string,
  unit?: string,
  state: APIItemState
}

export interface StakingJson {
  ready?: boolean,
  details: Record<string, StakingItem>
}

export interface PriceJson {
  ready?: boolean,
  currency: string,
  priceMap: Record<string, number>,
  tokenPriceMap: Record<string, number>
}

export enum APIItemState {
  PENDING = 'pending',
  READY = 'ready',
  CACHED = 'cached',
  ERROR = 'error',
  NOT_SUPPORT = 'not_support'
}

export enum RMRK_VER {
  VER_1 = '1.0.0',
  VER_2 = '2.0.0'
}

export enum CrowdloanParaState {
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface NftTransferExtra {
  cronUpdate: boolean;
  forceUpdate: boolean;
  selectedNftCollection?: NftCollection; // for rendering
  nftItems?: NftItem[]; // for rendering, remaining nfts
}

export interface NftItem {
  id?: string;
  name?: string;
  image?: string;
  external_url?: string;
  rarity?: string;
  collectionId?: string;
  description?: string;
  properties?: Record<any, any> | null;
  chain?: string;
  rmrk_ver?: RMRK_VER;
}

export interface NftCollection {
  collectionId: string;
  collectionName?: string;
  image?: string;
  chain?: string;
  itemCount?: number;
}

export interface NftJson {
  total: number;
  nftList: Array<NftItem>;
}

export interface NftCollectionJson {
  ready: boolean;
  nftCollectionList: Array<NftCollection>;
}

export interface BalanceChildItem {
  reserved: string,
  frozen: string,
  free: string,
  decimals: number
}

export interface BalanceItem {
  state: APIItemState,
  free: string,
  reserved: string,
  miscFrozen: string,
  feeFrozen: string,
  children?: Record<string, BalanceChildItem>
}

export interface BalanceJson {
  details: Record<string, BalanceItem>
}

export interface CrowdloanItem {
  state: APIItemState,
  paraState?: CrowdloanParaState,
  contribute: string
}

export interface CrowdloanJson {
  details: Record<string, CrowdloanItem>
}

export interface ChainRegistry {
  chainDecimals: number[];
  chainTokens: string[];
}

export interface DefaultFormatBalance {
  decimals?: number[] | number;
  unit?: string[] | string;
}

export interface ApiState {
  apiDefaultTx: SubmittableExtrinsicFunction;
  apiDefaultTxSudo: SubmittableExtrinsicFunction;
  isApiReady: boolean;
  isApiReadyOnce: boolean;
  isDevelopment?: boolean;
  isEthereum?: boolean;
  specName: string;
  specVersion: string;
  systemChain: string;
  systemName: string;
  systemVersion: string;
  registry: Registry;
  defaultFormatBalance: DefaultFormatBalance;
}

export interface ApiProps extends ApiState {
  api: ApiPromise;
  apiError?: string;
  apiUrl: string;
  isNotSupport?: boolean;
  isApiReadyOnce: boolean;
  isApiConnected: boolean;
  isEthereum: boolean;
  isApiInitialized: boolean;
  isReady: Promise<ApiProps>;
  apiRetry?: number;
  recoverConnect?: () => void;
  useEvmAddress?: boolean
}

export type NetWorkGroup = 'RELAY_CHAIN' | 'POLKADOT_PARACHAIN' | 'KUSAMA_PARACHAIN' | 'MAIN_NET' | 'TEST_NET' | 'UNKNOWN';

export interface NetWorkInfo {
  chain: string;
  genesisHash: string;
  icon?: string;
  ss58Format: number;
  chainType?: 'substrate' | 'ethereum';
  provider: string;
  groups: NetWorkGroup[];
  paraId?: number;
  isEthereum?: boolean;
  nativeToken?: string;
  crowdloanUrl?: string;
  decimals?: number;
}

export interface DonateInfo {
  key: string;
  name: string;
  value: string;
  icon: string;
  link: string;
}

export interface NetWorkMetadataDef extends MetadataDefBase {
  networkKey: string;
  groups: NetWorkGroup[];
  isEthereum: boolean;
  paraId?: number;
  isAvailable: boolean;
}

export type CurrentNetworkInfo = {
  networkKey: string;
  networkPrefix: number;
  icon: string;
  genesisHash: string;
  isEthereum: boolean;
}

// all Accounts and the address of the current Account
export interface AccountsWithCurrentAddress {
  accounts: AccountJson[];
  currentAddress?: string;
  isShowBalance?: boolean;
  allAccountLogo?: string;
}

export interface CurrentAccountInfo {
  address: string;
  isShowBalance?: boolean;
  allAccountLogo?: string;
}

export interface RandomTestRequest {
  start: number;
  end: number;
}

export type PdotApi = {
  keyring: Keyring;
  apisMap: Record<string, ApiProps>;
}

export interface BackgroundWindow extends Window {
  pdotApi: PdotApi;
}

export interface TransactionHistoryItemType {
  time: number;
  networkKey: string;
  change: string;
  fee?: string;
  isSuccess: boolean;
  action: 'send' | 'received';
  extrinsicHash: string
}

export interface MoonAsset {
  deposit: number,
  name: string,
  symbol: string,
  decimals: number,
  isFrozen: boolean,
  address: string
}

export interface RequestTransactionHistoryGet {
  address: string;
  networkKey: string;
}

export interface RequestTransactionHistoryGetByMultiNetworks {
  address: string;
  networkKeys: string[];
}

export interface RequestTransactionHistoryAdd {
  address: string;
  networkKey: string;
  item: TransactionHistoryItemType;
}

export interface RequestApi {
  networkKey: string;
}

export interface RequestAccountExportPrivateKey {
  address: string;
  password: string;
}

export interface ResponseAccountExportPrivateKey {
  privateKey: string;
}

export interface RequestSeedCreateV2 {
  length?: SeedLengths;
  seed?: string;
  types?: Array<KeypairType>;
}

export interface RequestSeedValidateV2 {
  suri: string;
  types?: Array<KeypairType>;
}

export interface RequestAccountCreateSuriV2 {
  name: string;
  genesisHash?: string | null;
  password: string;
  suri: string;
  types?: Array<KeypairType>
}

export interface ResponseSeedCreateV2 {
  seed: string,
  addressMap: Record<KeypairType, string>
}

export interface RequestCheckTransfer {
  networkKey: string,
  from: string,
  to: string,
  value?: string,
  transferAll?: boolean
}

export interface RequestTransfer extends RequestCheckTransfer {
  password: string;
}

export type ResponseSeedValidateV2 = ResponseSeedCreateV2
export type ResponseAccountCreateSuriV2 = Record<KeypairType, string>
export type AccountRef = Array<string>
export type AccountRefMap = Record<string, AccountRef>

export type RequestPrice = null
export type RequestSubscribePrice = null
export type RequestBalance = null
export type RequestSubscribeBalance = null
export type RequestCrowdloan = null
export type RequestSubscribeCrowdloan = null
export type RequestSubscribeNft = null
export type RequestSubscribeStaking = null
export type RequestSubscribeStakingReward = null
export type RequestNftForceUpdate = {
  collectionId: string,
  nft: NftItem,
  isSendingSelf: boolean,
  chain: string
}

export enum TransferErrorCode {
  INVALID_FROM_ADDRESS = 'invalidFromAccount',
  INVALID_TO_ADDRESS = 'invalidToAccount',
  NOT_ENOUGH_VALUE = 'notEnoughValue',
  INVALID_VALUE = 'invalidValue',
  KEYRING_ERROR = 'keyringError',
  TRANSFER_ERROR = 'transferError',
  TIMEOUT = 'timeout'
}

export type TransferError = {
  code: TransferErrorCode,
  data?: object,
  message: string
}

export interface ResponseCheckTransfer {
  errors?: Array<TransferError>,
  fromAccountFree: string,
  toAccountFree: string,
  estimateFee?: string
}

export enum TransferStep {
  READY = 'ready',
  START = 'start',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  ERROR = 'error'
}

export interface ResponseTransfer {
  step: TransferStep,
  errors?: Array<TransferError>,
  extrinsicHash?: string,
  extrinsicStatus?: string,
  data?: object
}

export interface KoniRequestSignatures {
  'pri(nftTransfer.setNftTransfer)': [NftTransferExtra, boolean];
  'pri(nftTransfer.getNftTransfer)': [null, NftTransferExtra];
  'pri(nftTransfer.getSubscription)': [null, NftTransferExtra, NftTransferExtra];
  'pri(nft.forceUpdate)': [RequestNftForceUpdate, boolean];
  'pri(api.init)': [RequestApi, ApiInitStatus];
  'pri(staking.getStaking)': [null, StakingJson];
  'pri(staking.getSubscription)': [RequestSubscribeStaking, StakingJson, StakingJson];
  'pri(stakingReward.getStakingReward)': [null, StakingRewardJson];
  'pri(stakingReward.getSubscription)': [RequestSubscribeStakingReward, StakingRewardJson, StakingRewardJson];
  'pri(nft.getNft)': [null, NftJson];
  'pri(nft.getSubscription)': [RequestSubscribeNft, NftJson, NftJson];
  'pri(nftCollection.getNftCollection)': [null, NftCollectionJson];
  'pri(nftCollection.getSubscription)': [null, NftCollectionJson, NftCollectionJson];
  'pri(price.getPrice)': [RequestPrice, PriceJson];
  'pri(price.getSubscription)': [RequestSubscribePrice, PriceJson, PriceJson];
  'pri(balance.getBalance)': [RequestBalance, BalanceJson];
  'pri(balance.getSubscription)': [RequestSubscribeBalance, BalanceJson, BalanceJson];
  'pri(crowdloan.getCrowdloan)': [RequestCrowdloan, CrowdloanJson];
  'pri(crowdloan.getSubscription)': [RequestSubscribeCrowdloan, CrowdloanJson, CrowdloanJson];
  'pri(authorize.listV2)': [null, ResponseAuthorizeList];
  'pri(authorize.requestsV2)': [RequestAuthorizeSubscribe, boolean, AuthorizeRequest[]];
  'pri(authorize.approveV2)': [RequestAuthorizeApprove, boolean];
  'pri(authorize.rejectV2)': [RequestAuthorizeReject, boolean];
  'pri(seed.createV2)': [RequestSeedCreateV2, ResponseSeedCreateV2];
  'pri(seed.validateV2)': [RequestSeedValidateV2, ResponseSeedValidateV2];
  'pri(accounts.create.suriV2)': [RequestAccountCreateSuriV2, ResponseAccountCreateSuriV2];
  'pri(accounts.checkTransfer)': [RequestCheckTransfer, ResponseCheckTransfer];
  'pri(accounts.transfer)': [RequestTransfer, Array<TransferError>, ResponseTransfer];
  'pri(derivation.createV2)': [RequestDeriveCreate, boolean];
  'pri(json.restoreV2)': [RequestJsonRestore, void];
  'pri(json.batchRestoreV2)': [RequestBatchRestore, void];
  'pri(accounts.exportPrivateKey)': [RequestAccountExportPrivateKey, ResponseAccountExportPrivateKey];
  'pri(accounts.subscribeWithCurrentAddress)': [RequestAccountSubscribe, boolean, AccountsWithCurrentAddress];
  'pri(accounts.triggerSubscription)': [null, boolean];
  'pri(currentAccount.saveAddress)': [RequestCurrentAccountAddress, boolean, CurrentAccountInfo];
  'pri(networkMetadata.list)': [null, NetWorkMetadataDef[]];
  'pri(chainRegistry.getSubscription)': [null, Record<string, ChainRegistry>, Record<string, ChainRegistry>];
  'pri(transaction.history.getSubscription)': [null, Record<string, TransactionHistoryItemType[]>, Record<string, TransactionHistoryItemType[]>];
  'pri(transaction.history.add)': [RequestTransactionHistoryAdd, boolean, TransactionHistoryItemType[]];
  'pub(utils.getRandom)': [RandomTestRequest, number];
}
