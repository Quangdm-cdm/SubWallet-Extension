// Copyright 2019-2022 @polkadot/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ThemeProps } from '../../types';

import React, { useCallback, useContext, useState } from 'react';
import styled from 'styled-components';

import { AuthUrlInfo } from '@polkadot/extension-base/background/handlers/State';
import { AccountContext, AccountInfoEl } from '@polkadot/extension-koni-ui/components';
import Toggle from '@polkadot/extension-koni-ui/components/Toggle';

import useTranslation from '../../hooks/useTranslation';

interface Props extends ThemeProps {
  className?: string;
  info: AuthUrlInfo;
  toggleAuth: (url: string) => void
  url: string;
}

function WebsiteEntry ({ className = '', info, toggleAuth, url }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [isShowDetail, setShowDetail] = useState<boolean>(false);
  const { hostname } = new URL(info.url);
  const { accounts } = useContext(AccountContext);
  const accountsWithoutAll = accounts.filter((acc) => acc.address !== 'ALL');

  console.log('info', info);

  const connectAll = useCallback(() => {
    if (!info.isAllowed) {
      toggleAuth(url);
    }
  }, [info.isAllowed, toggleAuth, url]);

  const disconnectAll = useCallback(() => {
    if (info.isAllowed) {
      toggleAuth(url);
    }
  }, [info.isAllowed, toggleAuth, url]);

  const _onToggleDetail = useCallback((e: React.MouseEvent<HTMLElement>) => {
    setShowDetail(!isShowDetail);
  }, [isShowDetail]);

  return (
    <div className={className}>
      <div
        className={`website-entry__main-content ${info.isAllowed ? 'allowed' : 'denied'} ${isShowDetail ? '-show-detail' : ''}`}
        onClick={_onToggleDetail}
      >
        <img
          alt={`${hostname}`}
          className='website-entry__connected-app-logo'
          src={`https://icons.duckduckgo.com/ip2/${hostname}.ico`}
        />
        <div className='origin'>
          {info.origin}
        </div>

        <div className='url'>
          {url}
        </div>

        <div className='website-entry__right-content'>
          <div className='website-entry__account-length'>{info.isAllowed ? accountsWithoutAll.length : 0}</div>
          <div className='website-entry__toggle' />
        </div>
      </div>
      {isShowDetail &&
        <div className='website-entry__detail'>
          <div className='website-entry__top-action'>
            <div className='website-entry__btn'>
              {t<string>('Forget Site')}
            </div>
            <div
              className='website-entry__btn'
              onClick={disconnectAll}
            >
              {t<string>('Disconnect All')}
            </div>
            <div
              className='website-entry__btn'
              onClick={connectAll}
            >
              {t<string>('Connect All')}
            </div>
          </div>
          {accountsWithoutAll.map((acc) =>
            <div
              className='website-entry__account'
              key={acc.address}
            >
              <AccountInfoEl
                address={acc.address}
                iconSize={22}
                isShowAddress={false}
                isShowBanner={false}
                showCopyBtn={false}
              />
              <Toggle
                label={''}
                value={info.isAllowed}
              />
            </div>

          )}
        </div>
      }
    </div>
  );
}

export default styled(WebsiteEntry)(({ theme }: Props) => `
  margin-bottom: 16px;

  .website-entry__main-content {
    display: flex;
    align-items: center;
    border-radius: 8px;
    background: ${theme.backgroundAccountAddress};
    padding: 10px;
    position: relative;
  }

  .website-entry__main-content:hover {
    cursor: pointer;
  }

  .origin {
    font-size: 15px;
    line-height: 26px;
    font-weight: 500;
    color: ${theme.textColor};
    padding-right: 7px;
  }

  .url{
    flex: 1;
    font-size: 14px;
    line-height: 24px;
    color: ${theme.manageWebsiteAccessColor};
  }

  .website-entry__connected-app-logo {
    width: 28px;
    min-width: 28px;
    margin-right: 8px;
  }

  .website-entry__right-content {

  }

  .website-entry__account-length {
    padding-right: 24px;
    font-size: 15px;
    line-height: 24px;
    font-weight: 500;
  }

  .website-entry__toggle {
    position: absolute;
    border-style: solid;
    border-width: 0px 1px 1px 0px;
    display: inline-block;
    padding: 3px;
    transform: rotate(-45deg);
    top: 20px;
    right: 13px;
  }

  .website-entry__main-content.-show-detail .website-entry__toggle {
    top: 18px;
    transform: rotate(45deg);
  }

  .website-entry__detail {
    background: ${theme.accountAuthorizeRequest};
    border-radius: 8px;
    margin-top: -48px;
    padding-top: 48px;
  }

  .website-entry__top-action {
    display: flex;
    justify-content: flex-end;
    padding: 10px 15px;
  }

  .website-entry__btn {
    padding-left: 17px;
    position: relative;
    font-size: 14px;
    line-height: 24px;
    color: ${theme.textColor2};
  }

  .website-entry__btn:hover {
    cursor: pointer;
    color: ${theme.buttonTextColor2};
  }

  .website-entry__btn:not(:first-child):before {
    content: '';
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background-color: ${theme.textColor2};
    top: 0;
    bottom: 0;
    left: 7px;
    margin: auto 0;
  }

  .website-entry__account {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;

    .account-info-row {
      height: 50px;
    }
  }
`);
