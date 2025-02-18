// Copyright 2019-2022 @polkadot/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson } from '@polkadot/extension-base/background/types';

import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import check from '@polkadot/extension-koni-ui/assets/check.svg';
import changeAvatar from '@polkadot/extension-koni-ui/assets/icon/camera.svg';
import changeAvatarHover from '@polkadot/extension-koni-ui/assets/icon/camera-hover.svg';
import { AccountContext, AccountInfoEl, ActionContext } from '@polkadot/extension-koni-ui/components';
import useIsPopup from '@polkadot/extension-koni-ui/hooks/useIsPopup';
import useToast from '@polkadot/extension-koni-ui/hooks/useToast';
import useTranslation from '@polkadot/extension-koni-ui/hooks/useTranslation';
import { saveCurrentAccountAddress, triggerAccountsSubscription, windowOpen } from '@polkadot/extension-koni-ui/messaging';
import { RootState } from '@polkadot/extension-koni-ui/stores';
import { ThemeProps } from '@polkadot/extension-koni-ui/types';
import { findAccountByAddress, isAccountAll } from '@polkadot/extension-koni-ui/util';

interface Props extends AccountJson {
  className?: string;
  parentName?: string;
  closeSetting?: () => void;
  changeAccountCallback?: (address: string) => void;
  imgSelected?: string | null;
  setImgSelected?: (imgSelected: string | null) => void;
}

function Account ({ address, changeAccountCallback, className, closeSetting, genesisHash, imgSelected, name, parentName, setImgSelected, suri, type }: Props): React.ReactElement<Props> {
  const [isSelected, setSelected] = useState(false);
  const { accounts } = useContext(AccountContext);
  const onAction = useContext(ActionContext);
  const currentAccount = useSelector((state: RootState) => state.currentAccount.account);
  const _isAllAccount = isAccountAll(address);
  const { t } = useTranslation();
  const inputRef: React.RefObject<HTMLInputElement> | null = useRef(null);
  const isPopup = useIsPopup();
  const isFirefox = window.localStorage.getItem('browserInfo') === 'Firefox';
  const isLinux = window.localStorage.getItem('osInfo') === 'Linux';
  const { setToastError, show } = useToast();

  useEffect((): void => {
    if (currentAccount?.address === address) {
      setSelected(true);
    } else {
      setSelected(false);
    }
  }, [address, currentAccount?.address]);

  const _changeAccount = useCallback(
    () => {
      setSelected(true);

      if (address) {
        const accountByAddress = findAccountByAddress(accounts, address);

        if (accountByAddress) {
          saveCurrentAccountAddress(address).then(() => {
            window.localStorage.removeItem('accountAllNetworkGenesisHash');
            triggerAccountsSubscription().catch((e) => {
              console.error('There is a problem when trigger Accounts Subscription', e);
            });

            changeAccountCallback && changeAccountCallback(address);
          }).catch((e) => {
            console.error('There is a problem when set Current Account', e);
          });
        } else {
          console.error('There is a problem when change account');
        }
      }

      closeSetting && closeSetting();
      onAction('/');
    }, [accounts, address, changeAccountCallback, closeSetting, onAction]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateAvatar = (file: Blob) => {
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = function () {
      setImgSelected && setImgSelected(reader.result as string);
      localStorage.setItem('allAccountLogo', reader.result as string);
    };

    reader.onerror = function (error) {
      console.log('Error: ', error);
    };
  };

  const fileSelectedChange = useCallback(
    (event: any): void => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
      const size = event.target.files[0].size;

      if (size < 3670016) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
        updateAvatar(event.target.files[0]);
      } else {
        setToastError(true);
        show(t('File is too large (limited 3.5MB)'));
      }
    }, [updateAvatar, setToastError, show, t]);

  const onSelectImg = useCallback(() => {
    if (isPopup && (isFirefox || isLinux)) {
      windowOpen('/').catch(console.error);
    }

    inputRef.current && inputRef.current.click();
  }, [isFirefox, isLinux, isPopup]);

  return (
    <div
      className={className}
      onClick={_changeAccount}
    >
      {isSelected
        ? (
          <img
            alt='check'
            src={check}
          />
        )
        : (
          <div className='account-unchecked-item' />
        )
      }
      <AccountInfoEl
        address={address}
        className='account__account-item'
        genesisHash={genesisHash}
        imgSelected={imgSelected}
        name={name}
        parentName={parentName}
        showCopyBtn={false}
        suri={suri}
        type={type}
      />

      {_isAllAccount && (
        <div
          className='account__change-avatar'
          onClick={onSelectImg}
        >
          <input
            accept='.jpg, .jpeg, .png'
            onChange={fileSelectedChange}
            ref={inputRef}
            style={{ display: 'none' }}
            type='file'
          />
          <span className='account__change-avatar-text'>{t<string>('Change Avatar')}</span>
          <div className='account__change-avatar-icon-btn'>
            <img
              alt='change'
              className='account__change-avatar-icon'
              src={changeAvatar}
            />

            <img
              alt='change'
              className='account__change-avatar-icon-hover'
              src={changeAvatarHover}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default styled(Account)(({ theme }: ThemeProps) => `
  position: relative;
  padding: 0 15px;
  border-radius: 8px;
  margin-top: 8px;
  display: flex;
  &:hover {
    background-color: ${theme.accountHoverBackground};
    cursor: pointer;
  }

  .account__account-item {
    margin-left: 5px;
  }

  .account-unchecked-item {
    width: 19px;
  }

  .account__change-avatar {
    display: flex;
    position: absolute;
    align-items: center;
    right: 15px;
    height: 100%;
  }

  .account__change-avatar-icon-btn {
    border-radius: 8px;
    padding: 6px;
    background-color: ${theme.accountHoverBackground};
    width: 32px;
    height: 32px;
  }

  .account__change-avatar {
    .account__change-avatar-icon {
      display: block;
    }

    .account__change-avatar-icon-hover {
      display: none;
    }
  }

  .account__change-avatar:hover {
    .account__change-avatar-icon {
      display: none;
    }

    .account__change-avatar-icon-hover {
      display: block;
    }
  }

  .account__change-avatar-text {
    font-size: 13px;
    line-height: 24px;
    color: ${theme.textColor2};
    padding-right: 7px;
  }

  .account__change-avatar-icon,
  .account__change-avatar-icon-hover {
    width: 20px;
    min-width: 20px;
  }
`);
