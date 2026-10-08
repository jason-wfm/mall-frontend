import request from '@/utils/request'
import { URL } from '@/config'

export function getInfo(params) {
  return request({
    url: URL.merchant.account.info,
    method: 'get',
    params,
  })
}

export function doEdit(params, data) {
  return request({
    url: URL.merchant.account.edit,
    method: 'post',
    params,
    data,
  })
}
