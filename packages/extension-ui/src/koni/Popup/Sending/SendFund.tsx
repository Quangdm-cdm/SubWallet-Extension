import BN from 'bn.js';
import { ThemeProps } from '@polkadot/extension-ui/types';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { InputAddress, Toggle } from '@polkadot/extension-ui/koni/react-components';
import { Available } from '@polkadot/extension-ui/koni/react-query';
import useTranslation from '@polkadot/extension-ui/hooks/useTranslation';
import KoniHeader from '@polkadot/extension-ui/partials/KoniHeader';
import InputBalance from '@polkadot/extension-ui/koni/react-components/InputBalance';
import { useApi, useCall } from '@polkadot/extension-ui/koni/react-hooks';
import { BN_HUNDRED, BN_ZERO, isFunction } from '@polkadot/util';
import { DeriveBalancesAll } from '@polkadot/api-derive/types';
// import {useApi} from "@polkadot/extension-ui/koni/react-hooks";
import { checkAddress } from '@polkadot/phishing';
import { AccountInfoWithProviders, AccountInfoWithRefCount } from '@polkadot/types/interfaces';
import { CurrentAccContext } from '@polkadot/extension-base/background/types';
import { CurrentAccountContext } from '@polkadot/extension-ui/components';
import KoniWarning from '@polkadot/extension-ui/components/KoniWarning';
import KoniLoading from '@polkadot/extension-ui/components/KoniLoading';
import KoniButton from '@polkadot/extension-ui/components/KoniButton';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import AuthTransaction from '@polkadot/extension-ui/koni/Popup/Sending/AuthTransaction';
import { TxResult } from '@polkadot/extension-ui/koni/Popup/Sending/types';
import { SubmittableResult } from '@polkadot/api';
import SendFundResult from '@polkadot/extension-ui/koni/Popup/Sending/SendFundResult';

interface Props extends ThemeProps {
  className?: string;
}

function isRefcount(accountInfo: AccountInfoWithProviders | AccountInfoWithRefCount): accountInfo is AccountInfoWithRefCount {
  return !!(accountInfo as AccountInfoWithRefCount).refcount;
}

async function checkPhishing(_senderId: string | null, recipientId: string | null): Promise<[string | null, string | null]> {
  return [
    // not being checked atm
    // senderId
    //   ? await checkAddress(senderId)
    //   : null,
    null,
    recipientId
      ? await checkAddress(recipientId)
      : null
  ];
}

function Wrapper(props: Props): React.ReactElement<Props> {
  const {t} = useTranslation();
  const {isApiReady, isNotSupport} = useApi();

  //todo: handle when remove All account or no account

  return (
    <div className={`-wrapper ${props.className}`}>
      <KoniHeader
        showAdd
        showSearch
        showSettings
        showSubHeader
        subHeaderName={t<string>('Send fund')}
        showCancelButton
      />

      {isApiReady ? (<SendFund {...props} />)
        : isNotSupport
          ? (
            <div className={'kn-l-screen-content'}>
              <KoniWarning>
                {t<string>('The action is not supported. Please change to another network.')}
              </KoniWarning>
            </div>
          )
          : (<KoniLoading />)
      }
    </div>
  );
}

function SendFund({className}: Props): React.ReactElement {
  const {t} = useTranslation();
  const {api, apiUrl} = useApi();
  const {currentAccount} = useContext<CurrentAccContext>(CurrentAccountContext);
  const propSenderId = currentAccount?.address;
  const [amount, setAmount] = useState<BN | undefined>(BN_ZERO);
  const [hasAvailable] = useState(true);
  const [isProtected, setIsProtected] = useState(false);
  const [isAll, setIsAll] = useState(false);
  const [[maxTransfer, noFees], setMaxTransfer] = useState<[BN | null, boolean]>([null, false]);
  const [recipientId, setRecipientId] = useState<string | null>(null);
  const [senderId, setSenderId] = useState<string | null>(null);
  const [[, recipientPhish], setPhishing] = useState<[string | null, string | null]>([null, null]);
  const balances = useCall<DeriveBalancesAll>(api.derive.balances?.all, [senderId], undefined, apiUrl);
  const accountInfo = useCall<AccountInfoWithProviders | AccountInfoWithRefCount>(api.query.system.account, [senderId], undefined, apiUrl);
  const [extrinsic, setExtrinsic] = useState<SubmittableExtrinsic<'promise'> | null>(null);
  const [isShowTxModal, setShowTxModal] = useState<boolean>(false);
  const [txResult, setTxResult] = useState<TxResult>({isShowTxResult: false, isTxSuccess: false});
  const {isShowTxResult} = txResult;

  useEffect((): void => {
    const fromId = senderId as string;
    const toId = recipientId as string;

    if (balances && balances.accountId.eq(fromId) && fromId && toId && isFunction(api.rpc.payment?.queryInfo)) {
      setTimeout((): void => {
        try {
          api.tx.balances
            .transfer(toId, balances.availableBalance)
            .paymentInfo(fromId)
            .then(({partialFee}): void => {
              const adjFee = partialFee.muln(110).div(BN_HUNDRED);
              const maxTransfer = balances.availableBalance.sub(adjFee);

              setMaxTransfer(
                maxTransfer.gt(api.consts.balances.existentialDeposit)
                  ? [maxTransfer, false]
                  : [null, true]
              );
            })
            .catch(console.error);
        } catch (error) {
          console.error((error as Error).message);
        }
      }, 0);
    } else {
      setMaxTransfer([null, false]);
    }
  }, [api, balances, propSenderId, recipientId, senderId]);

  useEffect((): void => {
    checkPhishing(senderId, recipientId)
      .then(setPhishing)
      .catch(console.error);
  }, [propSenderId, recipientId, senderId]);

  const noReference = accountInfo
    ? isRefcount(accountInfo)
      ? accountInfo.refcount.isZero()
      : accountInfo.consumers.isZero()
    : true;
  const canToggleAll = !isProtected && balances && balances.accountId.eq(senderId) && maxTransfer && noReference;

  const amountGtAvailableBalance = amount && balances && amount.gt(balances.availableBalance);

  const txParams: unknown[] | (() => unknown[]) | null =
    canToggleAll && isAll
      ? isFunction(api.tx.balances.transferAll)
      ? [recipientId, false]
      : [recipientId, maxTransfer]
      : [recipientId, amount];

  const tx: ((...args: any[]) => SubmittableExtrinsic<'promise'>) | null = canToggleAll && isAll && isFunction(api.tx.balances.transferAll)
    ? api.tx.balances.transferAll
    : isProtected
      ? api.tx.balances.transferKeepAlive
      : api.tx.balances.transfer;

  const _onSend = useCallback(() => {
    if (tx) {
      setExtrinsic(tx(...(
        isFunction(txParams)
          ? txParams()
          : (txParams || [])
      )) as SubmittableExtrinsic<'promise'>);

      setShowTxModal(true);
    }
  }, [txParams, tx]);

  const _onCancelTx = useCallback(() => {
    setExtrinsic(null);
    setShowTxModal(true);
  }, []);

  const _onTxSuccess = useCallback((result: SubmittableResult) => {
    setTxResult({
      isShowTxResult: true,
      isTxSuccess: true
    });

    _onCancelTx();
  }, []);

  const _onTxFail = useCallback((result: Error | SubmittableResult | null) => {
    setTxResult({
      isShowTxResult: true,
      isTxSuccess: false,
      txError: result
    });

    _onCancelTx();
  }, []);

  const isSameAddress = !!recipientId && !!senderId && (recipientId === senderId);

  return (
    <>
      {!isShowTxResult ? (
        <div className={`${className} -main-content`}>
          <InputAddress
            withEllipsis
            className={'kn-field -field-1'}
            defaultValue={propSenderId}
            help={t<string>('The account you will send funds from.')}
            // isDisabled={!!propSenderId}
            label={t<string>('Send from account')}
            labelExtra={
              <Available
                label={t<string>('Transferable')}
                params={senderId}
              />
            }
            onChange={setSenderId}
            type='account'
          />
          <InputAddress
            withEllipsis
            className={'kn-field -field-2'}
            autoPrefill={false}
            help={t<string>('Select a contact or paste the address you want to send funds to.')}
            // isDisabled={!!propRecipientId}
            label={t<string>('Send to address')}
            labelExtra={
              <Available
                label={t<string>('Transferable')}
                params={recipientId}
              />
            }
            onChange={setRecipientId}
            type='allPlus'
          />
          {recipientPhish && (
            <KoniWarning isDanger className={'kn-l-warning'}>
              {t<string>('The recipient is associated with a known phishing site on {{url}}', {replace: {url: recipientPhish}})}
            </KoniWarning>
          )}
          {isSameAddress && (
            <KoniWarning isDanger className={'kn-l-warning'}>
              {t<string>('The recipient address is the same as the sender address.')}
            </KoniWarning>
          )}
          {canToggleAll && isAll
            ? (
              <InputBalance
                className={'kn-field -field-3'}
                autoFocus
                defaultValue={maxTransfer}
                help={t<string>('The full account balance to be transferred, minus the transaction fees')}
                isDisabled
                key={maxTransfer?.toString()}
                label={t<string>('transferable minus fees')}
              />
            )
            : (
              <>
                <InputBalance
                  className={'kn-field -field-3'}
                  autoFocus
                  help={t<string>('Type the amount you want to transfer. Note that you can select the unit on the right e.g sending 1 milli is equivalent to sending 0.001.')}
                  isError={!hasAvailable}
                  isZeroable
                  placeholder={'0'}
                  label={t<string>('amount')}
                  // maxValue={maxTransfer}
                  onChange={setAmount}
                />
                {amountGtAvailableBalance && (
                  <KoniWarning isDanger className={'kn-l-warning'}>
                    {t<string>('The amount you want to transfer is greater than your available balance.')}
                  </KoniWarning>
                )}
                <InputBalance
                  className={'kn-field -field-4'}
                  defaultValue={api.consts.balances.existentialDeposit}
                  help={t<string>('The minimum amount that an account should have to be deemed active')}
                  isDisabled
                  label={t<string>('existential deposit')}
                />
              </>
            )
          }
          {isFunction(api.tx.balances.transferKeepAlive) && (
            <div className={'kn-field -toggle -toggle-1'}>
              <Toggle
                className='typeToggle'
                label={
                  isProtected
                    ? t<string>('Transfer with account keep-alive checks')
                    : t<string>('Normal transfer without keep-alive checks')
                }
                onChange={setIsProtected}
                value={isProtected}
              />
            </div>
          )}
          {canToggleAll && (
            <div className={'kn-field -toggle -toggle-2'}>
              <Toggle
                className='typeToggle'
                label={t<string>('Transfer the full account balance, reap the sender')}
                onChange={setIsAll}
                value={isAll}
              />
            </div>
          )}
          {!isProtected && !noReference && (
            <KoniWarning className={'kn-l-warning'}>
              {t<string>('There is an existing reference count on the sender account. As such the account cannot be reaped from the state.')}
            </KoniWarning>
          )}
          {!amountGtAvailableBalance && !isSameAddress && noFees && (
            <KoniWarning className={'kn-l-warning'}>
              {t<string>('The transaction, after application of the transfer fees, will drop the available balance below the existential deposit. As such the transfer will fail. The account needs more free funds to cover the transaction fees.')}
            </KoniWarning>
          )}

          <div className={'kn-l-submit-wrapper'}>
            <KoniButton
              className={'kn-submit-btn'}
              isDisabled={isSameAddress || !hasAvailable || !(recipientId) || (!amount && !isAll) || amountGtAvailableBalance || !!recipientPhish}
              onClick={_onSend}
            >
              {t<string>('Make Transfer')}
            </KoniButton>
          </div>
        </div>
      ) : (
        <SendFundResult
          txResult={txResult}
          setTxResult={setTxResult}
        />
      )}

      {extrinsic && isShowTxModal && (
        <AuthTransaction
          extrinsic={extrinsic}
          requestAddress={senderId}
          onCancel={_onCancelTx}
          txHandler={{
            onTxSuccess: _onTxSuccess,
            onTxFail: _onTxFail
          }}
        />
      )}
    </>
  );
}

export default React.memo(styled(Wrapper)(({theme}: Props) => `
  &.-wrapper {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    height: 100vh;
  }

  &.-main-content {
    padding-left: 15px;
    padding-right: 15px;
    padding-bottom: 15px;
    flex: 1;
    padding-top: 25px;
    margin-top: -25px;
    overflow-y: auto;

    // &::-webkit-scrollbar {
    //   display: none;
    // }
  }

  .kn-l-screen-content {
    flex: 1;
    padding: 0 15px 15px;
  }

  .kn-field {
    margin-bottom: 10px;

    &.-field-1 {
      z-index: 5;
    }

    &.-field-2 {
      z-index: 4;
      margin-bottom: 10px;
    }

    &.-field-3 {
      margin-top: 20px;
      z-index: 3;
    }

    &.-field-4 {
      z-index: 2;
    }

    &.-toggle {
      margin-top: 20px;
      margin-bottom: 20px;
      display: flex;
      justify-content: flex-end;
    }

    &.-field-4, &.-toggle-1 {
        display: none !important;
    }
  }

  .kn-l-warning {
    margin-top: 10px;
    margin-bottom: 10px;
  }

  .kn-l-submit-wrapper {
    position: sticky;
    bottom: -15px;
    padding: 15px;
    margin-left: -15px;
    margin-bottom: -15px;
    margin-right: -15px;
    background-color: ${theme.background};
  }
`));
